import * as moment from 'moment';
import { Provide, Inject, Scope, ScopeEnum, Config } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import * as path from 'path';
import * as fs from 'fs';
import { BaseModelService } from '@cicctencent/midwayjs-base';

import TaskConfigOrm from '../model/taskConfig';
import TaskInstanceOrm from '../model/taskInstance';
import { TaskStatus } from '../model/taskConst';
import TaskService from './task';
import NotifyService from './notify';
import { executeTask, cleanupExecDir } from '../lib/executor';

/**
 * 任务实例服务
 */
@Provide()
@Scope(ScopeEnum.Request, { allowDowngrade: true })
export default class TaskInstanceService extends BaseModelService<TaskInstanceOrm> {
    @InjectEntityModel(TaskInstanceOrm)
    protected model: Repository<TaskInstanceOrm>;

    @Inject()
    taskService: TaskService;

    @Inject()
    notifyService: NotifyService;

    @Config('executor')
    executorConfig: { workRoot?: string; requireAllowList?: string[] };

    /**
     * 安全获取日志器（服务可能被降级为单例作用域，此时没有 ctx）
     */
    private get logger(): any {
        try {
            return this.ctx?.log || this.app?.getLogger?.() || console;
        } catch (e) {
            return console;
        }
    }

    /** 数据根目录 */
    private get dataRoot(): string {
        return process.env.TASK_DATA_ROOT || path.join(process.cwd(), 'data');
    }

    /** 临时工作目录根 */
    private get workRoot(): string {
        return (
            this.executorConfig?.workRoot || path.join(this.dataRoot, 'exec')
        );
    }

    /**
     * 从任务配置创建实例
     */
    async createTaskInstance(
        task: TaskConfigOrm,
        qryRunner?: QueryRunner,
        master = '',
        triggerType = 0
    ) {
        const instance = new TaskInstanceOrm();
        instance.taskId = task.id;

        const user = this.ctx?.currentSession?.loginId || 'task';
        instance.creator = instance.updater = master || user; // master 非空表示系统自动执行
        instance.triggerType = triggerType;

        instance.createTime = instance.modifyTime = new Date();

        if (!qryRunner)
            qryRunner =
                this.model.manager.queryRunner ||
                this.model.manager.connection.createQueryRunner();

        return await qryRunner.connection
            .getRepository(TaskInstanceOrm)
            .save(instance);
    }

    /**
     * 从实例队列中取一个可以执行的实例
     */
    async getCanOneRun(qryRunner: QueryRunner) {
        const now = moment().format('YYYY-MM-DD HH:mm:ss');
        const queryBuilder = this.model.createQueryBuilder(
            'instance',
            qryRunner
        );
        const qry = queryBuilder
            .where('instance.status=:status', {
                status: TaskStatus.init,
            })
            // 仅领取已到重试时间的实例
            .andWhere(
                "(instance.nextRetryTime = '' or instance.nextRetryTime <= :now)",
                { now }
            )
            .orderBy('instance.id', 'ASC')
            .take(1);

        return await qry.getOne();
    }

    /**
     * 终结所有超时的实例
     *
     * 执行器自身已能真实中断进程，这里是兜底：
     * 覆盖服务重启、内联模式无法中断等场景。
     */
    async stopTimeoutTasks(qryRunner: QueryRunner) {
        try {
            const queryBuilder = this.model.createQueryBuilder(
                'instance',
                qryRunner
            );
            const qry = queryBuilder
                .leftJoin(
                    TaskConfigOrm,
                    'taskConfig',
                    'taskConfig.id=instance.taskId'
                )
                .where(
                    "instance.status=:status and taskConfig.Ftimeout > 0 and instance.execStartTime < DATE_FORMAT(DATE_SUB(NOW(), INTERVAL taskConfig.Ftimeout SECOND), '%Y-%m-%d %H:%i:%s')",
                    {
                        status: TaskStatus.running,
                    }
                );

            const items = await qry.getMany();
            for (const item of items) {
                if (item.pid > 0) {
                    await this.killProcess(item.pid);
                }
                item.status = TaskStatus.timeout;
                item.execEndTime = moment().format('YYYY-MM-DD HH:mm:ss');
                item.duration = item.execStartTime
                    ? moment(item.execEndTime).diff(
                          moment(item.execStartTime),
                          'milliseconds'
                      )
                    : 0;
                item.pid = 0;
                await this.model.save(item);

                const task = await this.taskService.getById(item.taskId);
                if (task) {
                    await this.notifyService.taskTimeout(
                        task,
                        `任务执行超过 ${task.timeout} 秒，已强制终止`,
                        item.id
                    );
                }
            }
        } catch (e) {
            this.logger.error?.('stopTimeoutTasks error:', e);
        }
    }

    /**
     * 强杀进程（含进程组）
     */
    private async killProcess(pid: number) {
        if (!pid || pid <= 0) return;
        try {
            if (process.platform !== 'win32') {
                // 先杀进程组，避免遗留子孙进程
                try {
                    process.kill(-pid, 'SIGKILL');
                } catch (e) {
                    /* ignore */
                }
            }
            process.kill(pid, 'SIGKILL');
        } catch (e) {
            // 进程可能已退出
        }
    }

    /**
     * 执行单个任务
     */
    async runTask(instance: TaskInstanceOrm) {
        const logger = this.logger;
        let task: TaskConfigOrm | undefined;

        try {
            task = await this.taskService.getById(instance.taskId);
            if (!task) {
                throw Error(`任务配置${instance.taskId}不存在`);
            }

            task.lastRunTime = instance.execStartTime;
            await this.taskService.save(task);

            const timeout = Number(task.timeout) || 0;
            const env = this.parseEnv(task.envJson);

            const result = await executeTask({
                task,
                instance,
                timeout,
                workRoot: this.workRoot,
                env,
                requireAllowList: this.executorConfig?.requireAllowList || [],
                onSpawn: (pid: number) => {
                    instance.pid = pid;
                },
            });

            instance.duration = result.duration;
            instance.exitCode = result.exitCode;
            instance.log = result.log || instance.log || '';
            instance.pid = 0;

            if (result.status === 'success') {
                instance.status = TaskStatus.success;
            } else if (result.status === 'timeout') {
                instance.status = TaskStatus.timeout;
            } else {
                instance.status = TaskStatus.failed;
            }

            // 失败重试：重新排队，等待重试时间到达
            const maxRetry = Number(task.maxRetry) || 0;
            if (
                instance.status === TaskStatus.failed &&
                instance.retryCount < maxRetry
            ) {
                instance.retryCount = instance.retryCount + 1;
                instance.status = TaskStatus.init;
                instance.nextRetryTime = moment()
                    .add(Number(task.retryInterval) || 60, 'seconds')
                    .format('YYYY-MM-DD HH:mm:ss');
                instance.execEndTime = '';
                logger.warn?.(
                    `任务[${task.id}]${task.name} 执行失败，将于 ${instance.nextRetryTime} 重试（第 ${instance.retryCount}/${maxRetry} 次）`
                );
                await this.save(instance);
                return instance;
            }

            // 连续失败计数与告警
            if (
                instance.status === TaskStatus.success ||
                instance.status === TaskStatus.timeout
            ) {
                if (task.consecutiveFailures > 0) {
                    task.consecutiveFailures = 0;
                    await this.taskService.save(task);
                    await this.notifyService.taskRecovered(task, instance.id);
                }
            } else {
                task.consecutiveFailures =
                    Number(task.consecutiveFailures || 0) + 1;
                await this.taskService.save(task);
                await this.notifyService.taskFailed(
                    task,
                    result.message || '任务执行失败',
                    instance.id
                );
                await this.notifyService.taskConsecutiveFailure(
                    task,
                    task.consecutiveFailures,
                    instance.id
                );
            }
        } catch (e) {
            instance.status = TaskStatus.failed;
            instance.log = `${instance.log || ''}\n[error] ${
                (e as Error)?.stack || String(e)
            }\n`;
            logger.error?.('runTask error:', e);

            if (task) {
                task.consecutiveFailures =
                    Number(task.consecutiveFailures || 0) + 1;
                await this.taskService.save(task);
                await this.notifyService.taskFailed(
                    task,
                    (e as Error)?.message || String(e),
                    instance.id
                );
            }
        }

        instance.execEndTime = moment().format('YYYY-MM-DD HH:mm:ss');

        // 日志落盘归档
        await this.archiveLog(instance);

        // 执行产物备份
        await this.backupPublish(task, instance);

        // 清理临时工作目录
        cleanupExecDir(this.workRoot, instance.id);

        return await this.save(instance); // 保存日志
    }

    /** 解析环境变量配置 */
    private parseEnv(envJson: string): Record<string, string> {
        if (!envJson) return {};
        try {
            const obj = JSON.parse(envJson);
            if (obj && typeof obj === 'object') {
                const result: Record<string, string> = {};
                for (const key of Object.keys(obj)) {
                    result[key] = String(obj[key]);
                }
                return result;
            }
        } catch (e) {
            this.logger.warn?.('任务环境变量解析失败，已忽略');
        }
        return {};
    }

    /** 日志落盘归档 */
    private async archiveLog(instance: TaskInstanceOrm) {
        if (!instance.log) return;
        try {
            const dir = path.join(
                this.dataRoot,
                'logs',
                'tasks',
                String(instance.taskId)
            );
            fs.mkdirSync(dir, { recursive: true });
            const file = path.join(dir, `${instance.id}.log`);
            fs.writeFileSync(file, instance.log, 'utf8');
            instance.logPath = path.relative(this.dataRoot, file);
        } catch (e) {
            this.logger.warn?.('日志归档失败:', e);
        }
    }

    /** 执行产物备份 */
    private async backupPublish(
        task: TaskConfigOrm | undefined,
        instance: TaskInstanceOrm
    ) {
        if (!task?.publishDir) return;
        try {
            if (!fs.existsSync(task.publishDir)) return;
            const stamp = moment().format('YYYYMMDDHHmmss');
            const target = path.join(
                this.dataRoot,
                'publish',
                String(task.id),
                stamp
            );
            fs.mkdirSync(path.dirname(target), { recursive: true });
            fs.cpSync(task.publishDir, target, { recursive: true });
            instance.publishPath = path.relative(this.dataRoot, target);
        } catch (e) {
            this.logger.warn?.('产物备份失败:', e);
        }
    }

    /** 通过ID获取 */
    async getById(id: number) {
        return await this.model.findOneBy({ id });
    }

    /**
     * 拉取任务最近的运行记录（按时间倒序）
     *
     * 供健康度诊断统计使用，只取必要字段，避免把日志正文一起读进内存。
     */
    async getRecentByTask(taskId: number, limit = 100) {
        return await this.model.find({
            where: { taskId },
            order: { id: 'DESC' },
            take: limit,
        });
    }

    /**
     * 查询任务运行记录
     */
    async query(params: {
        taskId?: number;
        status?: TaskStatus;
        execStartTime?: string;
        execEndTime?: string;
        size: number;
        page: number;
    }): Promise<any> {
        const strWhere = ['Task.id is not null'];
        const whereParams = {} as any;
        if (params.taskId) {
            strWhere.push('and TaskInstance.taskId=:taskId');
            whereParams['taskId'] = params.taskId;
        }
        if (params.status > 0) {
            strWhere.push('and TaskInstance.status = :status');
            whereParams['status'] = params.status;
        }
        if (params.execStartTime) {
            strWhere.push('and TaskInstance.execStartTime >= :execStartTime');
            whereParams['execStartTime'] = params.execStartTime;
        }
        if (params.execEndTime) {
            // 修正：结束时间条件应过滤 execEndTime 字段
            strWhere.push('and TaskInstance.execEndTime <= :execEndTime');
            whereParams['execEndTime'] = params.execEndTime;
        }

        params.size = Math.min(params.size || 20, 100);
        const skip = ((params.page || 1) - 1) * params.size || 0;

        const qry = this.model
            .createQueryBuilder('TaskInstance')
            .leftJoinAndSelect(
                TaskConfigOrm,
                'Task',
                'Task.id=TaskInstance.taskId'
            )
            .select('TaskInstance.id', 'id')
            .addSelect('TaskInstance.taskId', 'taskId')
            .addSelect('TaskInstance.execServer', 'execServer')
            .addSelect('TaskInstance.execStartTime', 'execStartTime')
            .addSelect('TaskInstance.execEndTime', 'execEndTime')
            .addSelect('TaskInstance.status', 'status')
            .addSelect('TaskInstance.duration', 'duration')
            .addSelect('TaskInstance.exitCode', 'exitCode')
            .addSelect('TaskInstance.retryCount', 'retryCount')
            .addSelect('TaskInstance.logPath', 'logPath')
            .addSelect('TaskInstance.publishPath', 'publishPath')
            .addSelect('TaskInstance.triggerType', 'triggerType')
            .addSelect('Task.name', 'taskName')
            .addSelect('TaskInstance.creator', 'creator')
            .addSelect('TaskInstance.updater', 'updater')
            .addSelect('TaskInstance.createTime', 'createTime')
            .addSelect('TaskInstance.modifyTime', 'modifyTime')
            .where(strWhere.join(' '), whereParams)
            .addOrderBy('TaskInstance.execStartTime', 'DESC')
            .addOrderBy('TaskInstance.status', 'ASC');

        return await qry.limit(params.size).offset(skip).getRawMany();
    }

    /**
     * 修改实例状态
     */
    async updateStatus(id: number, status: TaskStatus) {
        const instance = await this.model.findOneBy({ id });
        if (!instance) throw Error('实例不存在');
        instance.status = status;

        return await this.save(instance);
    }

    /**
     * 人工终止正在运行的实例
     */
    async killInstance(id: number) {
        const instance = await this.getById(id);
        if (!instance) throw Error('实例不存在');
        if (instance.status !== TaskStatus.running) {
            throw Error('实例未在运行中');
        }

        // 强杀子进程
        if (instance.pid > 0) {
            await this.killProcess(instance.pid);
        }

        instance.status = TaskStatus.canceled;
        instance.execEndTime = moment().format('YYYY-MM-DD HH:mm:ss');
        instance.duration = instance.execStartTime
            ? moment(instance.execEndTime).diff(
                  moment(instance.execStartTime),
                  'milliseconds'
              )
            : 0;
        instance.pid = 0;
        instance.log = `${instance.log || ''}\n[warn] 任务被人工终止\n`;

        return await this.save(instance);
    }

    /**
     * 清除指定时间前的已结束实例
     */
    async clear(endTime: Date) {
        const queryBuilder = this.model.createQueryBuilder();
        const qry = queryBuilder
            .where('Fcreate_time<=:endTime and Fstatus>1', {
                endTime,
            })
            .delete();

        return await qry.execute();
    }
}
