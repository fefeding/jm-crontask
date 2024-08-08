import { Autoload,Provide, Scope, ScopeEnum, Init, Inject } from '@midwayjs/core';
import { QueryRunner } from 'typeorm';
import * as moment from 'moment';
import * as ip from 'ip';
import { BaseService } from '../../base/base.service';
import { TaskLockKeys, TaskStatus } from '../../model/taskConst';
import TaskService from '../task';
import InstanceService from '../taskInstance';
import TaskLockService from '../taskLock';

@Autoload()
@Provide()
@Scope(ScopeEnum.Singleton)
export class RunnerService extends BaseService { 

    @Inject()
    taskService: TaskService;

    @Inject()
    instanceService: InstanceService;

    @Inject()
    taskLockService: TaskLockService;

    @Init()
    async init() {
        this.master();// 启动主任务
    }

    runningTaskCount = 0;// 当前正在跑的task个数
    maxRunningCount = 5; // 最多同时多少个task

    // 任务分配主进程
    async master() {
        try {
        //     const manager = await this.app.getApplicationContext().getAsync(TypeORMDataSourceManager) as any;
        //     const dataSource = manager.getDataSource(manager.getDefaultDataSourceName()) as DataSource;
        //     const queryInner = dataSource.createQueryRunner();
            // 在锁的事务中执行
            await this.taskLockService.runLock(TaskLockKeys.master, async (queryInner: QueryRunner) => {
                // 先获取可以执行的任务
                const tasks = await this.taskService.getCurrentTimeNeedRunTasks(queryInner);
                // 生成执行实例
                for(const task of tasks) {
                    await this.instanceService.createTaskInstance(task, queryInner);
                }
            });
        }
        catch(e) {
            console.error(e);
        }
        finally {
            await this.sleep(10000);// 每10秒跑一次

            this.master();
        }
    } 

    // 子任务处理逻辑
    async subTask() {
        try {
            if(this.runningTaskCount >= this.maxRunningCount) return;// 超过个数则不处理
            this.run();
        }
        catch(e) {
            console.error(e);
        }
        finally {
            await this.sleep(2000);
            this.subTask();
        }
    }

    // 任务执行主体，继承的类只要写这个函数即可
    async run() {
        try {
            this.runningTaskCount++;
            // 任务开始前队列锁，多个线程等待取运行实例
            const taskInstance = await this.taskLockService.runLock(TaskLockKeys.task, async (queryInner: QueryRunner) => {
                // 从实例队列中取一个可以执行的
                const instance = await this.instanceService.getCanOneRun(queryInner);
                if(instance) {
                    instance.status = TaskStatus.running;// 把实例标记为正在执行，其它任务不再获取它
                    instance.execStartTime = moment().format('YYYY-MM-DD HH:mm:ss');
                    instance.execServer = ip.address();
                    await this.instanceService.save(instance, queryInner);
                }
                return instance;
            });

            // 事务完后，执行任务
            taskInstance && await this.instanceService.runTask(taskInstance);// 开始执行
        }
        catch(e) {
            console.error(e);
            this.ctx?.logger?.error(e);
        }
        finally {
            this.runningTaskCount--;
        }
    }

    // 等待一定时间
    async sleep(time: number = 10) {
        return new Promise<void>((resolve, reject) => {
            setTimeout(()=>{
                resolve();
            }, time);
        });
    }
}
