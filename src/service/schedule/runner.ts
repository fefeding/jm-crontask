import {
    Autoload,
    Provide,
    Scope,
    ScopeEnum,
    Init,
    Inject,
    Config,
} from '@midwayjs/core';
import { QueryRunner } from 'typeorm';
import * as moment from 'moment';
import * as ip from 'ip';
import { BaseService } from '@cicctencent/midwayjs-base';
import {
    TaskLockKeys,
    TaskStatus,
    TaskState,
    TaskTimeSize,
    TaskMissPolicy,
} from '../../model/taskConst';
import TaskService from '../task';
import InstanceService from '../taskInstance';
import TaskLockService from '../taskLock';
import NotifyService from '../notify';
import MaintainService from '../maintain';
import { ScheduleInfo } from '../../lib/time-calculator';

@Autoload()
@Provide()
@Scope(ScopeEnum.Singleton)
export class RunnerService extends BaseService {
    @Config('master')
    masterConfig: {
        node: boolean;
        minInterval?: number;
        maxInterval?: number;
        maxRunningCount?: number;
        maxCatchUp?: number;
    };

    @Inject()
    taskService: TaskService;

    @Inject()
    instanceService: InstanceService;

    @Inject()
    taskLockService: TaskLockService;

    @Inject()
    notifyService: NotifyService;

    @Inject()
    maintainService: MaintainService;

    @Config('maintain')
    maintainConfig: { enabled?: boolean; interval?: number };

    @Init()
    async init() {
        if (!this.masterConfig?.node) return; // 不作为任务节点运行
        this.master(); // 启动调度主循环
        this.subTask(); // 启动执行子循环
        this.watchdog(); // 启动超时看门狗
        this.maintain(); // 启动归档维护
    }

    /** 当前正在跑的task个数 */
    runningTaskCount = 0;

    /** 最多同时多少个task */
    get maxRunningCount(): number {
        return this.masterConfig?.maxRunningCount || 5;
    }

    /** 最小轮询间隔 */
    get minInterval(): number {
        return this.masterConfig?.minInterval || 200;
    }

    /** 最大轮询间隔 */
    get maxInterval(): number {
        return this.masterConfig?.maxInterval || 30000;
    }

    /** 单次补偿的最大执行次数 */
    get maxCatchUp(): number {
        return this.masterConfig?.maxCatchUp || 10;
    }

    /** 是否已停止 */
    private stopping = false;

    /** 已经告警过的非法配置，避免每次调度重复告警 */
    private invalidConfigAlerted = new Map<number, string>();

    private get logger(): any {
        try {
            return this.ctx?.log || this.app?.getLogger?.() || console;
        } catch (e) {
            return console;
        }
    }

    /**
     * 停止调度
     */
    async stop() {
        this.stopping = true;
    }

    // ------------------------------------------------------------------
    // 调度主循环：精确计算下次唤醒时间，空闲时自动降频
    // ------------------------------------------------------------------
    async master() {
        if (this.stopping) return;
        let sleepTime = this.minInterval;
        try {
            const now = Date.now();
            let nextWakeAt = 0;

            // 在锁的事务中执行，保证多节点下不会重复创建实例
            await this.taskLockService.runLock(
                TaskLockKeys.master,
                async (queryInner: QueryRunner) => {
                    const { tasks, schedules, invalid } =
                        await this.taskService.getDueTasks(queryInner, now);

                    // 采集最近的下次唤醒时间
                    for (const info of schedules.values()) {
                        if (
                            info.nextRunAt > 0 &&
                            (nextWakeAt === 0 || info.nextRunAt < nextWakeAt)
                        ) {
                            nextWakeAt = info.nextRunAt;
                        }
                    }

                    // 配置非法告警（同一错误只告警一次）
                    for (const item of invalid) {
                        const alerted = this.invalidConfigAlerted.get(
                            item.task.id
                        );
                        if (alerted !== item.error) {
                            this.invalidConfigAlerted.set(
                                item.task.id,
                                item.error
                            );
                            await this.notifyService.taskInvalidConfig(
                                item.task,
                                item.error
                            );
                        }
                    }

                    // 创建执行实例
                    for (const task of tasks) {
                        const info = schedules.get(task.id);
                        await this.createInstances(task, info, queryInner);
                    }
                }
            );

            // 根据最近的下次执行时间决定休眠时长
            if (nextWakeAt > 0) {
                const delay = nextWakeAt - Date.now();
                sleepTime = Math.max(
                    this.minInterval,
                    Math.min(delay, this.maxInterval)
                );
            } else {
                sleepTime = this.maxInterval;
            }
        } catch (e) {
            this.logger.error?.('调度主循环异常:', e);
            sleepTime = this.minInterval;
        } finally {
            await this.sleep(sleepTime);
            this.master();
        }
    }
    /**
     * 为到期任务创建执行实例（支持漏跑补偿）
     */
    private async createInstances(
        task: any,
        info: ScheduleInfo | undefined,
        queryInner: QueryRunner
    ) {
        if (!info) return;

        let count = 1;
        if (info.missed > 1) {
            switch (task.missPolicy) {
                case TaskMissPolicy.all:
                    // 全量补偿，但受最大补偿次数限制
                    count = Math.min(info.missed, this.maxCatchUp);
                    break;
                case TaskMissPolicy.skip:
                    // 错过就错过，只在恰好命中计划点时执行
                    count = 0;
                    break;
                case TaskMissPolicy.once:
                default:
                    // 合并成一次执行
                    count = 1;
                    break;
            }
        }

        // 漏跑告警：只有新增的漏跑才通知
        if (info.missed > 1 && info.missed > Number(task.missCount || 0)) {
            await this.notifyService.taskMissed(task, info.missed);
        }

        if (count > 0) {
            for (let i = 0; i < count; i++) {
                await this.instanceService.createTaskInstance(
                    task,
                    queryInner,
                    'system',
                    0
                );
            }
            this.logger.info?.(
                `任务[${task.id}]${task.name} 已创建 ${count} 个执行实例`
            );
        }

        // 记录漏跑次数
        if (Number(task.missCount || 0) !== info.missed) {
            task.missCount = info.missed;
            await queryInner.connection
                .getRepository(task.constructor)
                .save(task);
        }

        // 单次任务执行后自动失效
        if (
            task.timeSize === TaskTimeSize.single &&
            task.state === TaskState.start
        ) {
            task.state = TaskState.disabled;
            await queryInner.connection
                .getRepository(task.constructor)
                .save(task);
        }
    }

    // ------------------------------------------------------------------
    // 执行子循环：按并发上限领取实例执行
    // ------------------------------------------------------------------
    async subTask() {
        if (this.stopping) return;
        try {
            // 尽可能填满并发额度
            while (
                !this.stopping &&
                this.runningTaskCount < this.maxRunningCount
            ) {
                const started = await this.pickAndRun();
                if (!started) break; // 队列里没有可执行的实例
            }
        } catch (e) {
            this.logger.error?.('执行子循环异常:', e);
        } finally {
            await this.sleep(this.minInterval);
            this.subTask();
        }
    }

    /**
     * 领取一个实例并后台执行
     */
    private async pickAndRun(): Promise<boolean> {
        const taskInstance = await this.taskLockService.runLock(
            TaskLockKeys.task,
            async (queryInner: QueryRunner) => {
                // 从实例队列中取一个可以执行的
                const instance = await this.instanceService.getCanOneRun(
                    queryInner
                );
                if (instance) {
                    instance.status = TaskStatus.running; // 把实例标记为正在执行，其它任务不再获取它
                    instance.execStartTime = moment().format(
                        'YYYY-MM-DD HH:mm:ss'
                    );
                    instance.execServer = ip.address();
                    await this.instanceService.save(instance, queryInner);
                }
                return instance;
            }
        );

        if (!taskInstance) return false;

        this.runningTaskCount++;
        // 后台执行，不阻塞调度循环
        Promise.resolve()
            .then(() => this.instanceService.runTask(taskInstance))
            .catch(e => {
                this.logger.error?.('任务执行异常:', e);
            })
            .finally(() => {
                this.runningTaskCount--;
            });

        return true;
    }

    // ------------------------------------------------------------------
    // 看门狗：兜底处理超时实例
    // ------------------------------------------------------------------
    async watchdog() {
        if (this.stopping) return;
        try {
            await this.taskLockService.runLock(
                TaskLockKeys.watchdog,
                async (queryInner: QueryRunner) => {
                    await this.instanceService.stopTimeoutTasks(queryInner);
                }
            );
        } catch (e) {
            this.logger.error?.('超时看门狗异常:', e);
        } finally {
            await this.sleep(Math.min(this.maxInterval, 10000));
            this.watchdog();
        }
    }

    // ------------------------------------------------------------------
    // 归档维护：清理历史实例、日志与产物
    // ------------------------------------------------------------------
    async maintain() {
        if (this.stopping) return;
        try {
            await this.maintainService.run();
        } catch (e) {
            this.logger.error?.('归档维护异常:', e);
        } finally {
            await this.sleep(this.maintainConfig?.interval || 3600000);
            this.maintain();
        }
    }

    // 等待一定时间
    async sleep(time = 10) {
        return new Promise<void>(resolve => {
            setTimeout(() => {
                resolve();
            }, time);
        });
    }
}
