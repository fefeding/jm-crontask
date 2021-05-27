
import { Subscription  } from 'egg';
import { QueryRunner } from 'typeorm';
import { EggTaskOption, TaskLockKeys, TaskStatus } from '../model/taskConst';

// 任务配置
const TaskOptions = new Map<string, EggTaskOption>();

// 定时发布资讯
export default class BaseTask extends Subscription
{
     // 通过 schedule 属性来设置定时任务的执行间隔等配置
    static get schedule() {
        return {
            interval: '10s', // 1 分钟间隔
            type: 'all', // all 指定所有的 worker 都需要执行,  worker只有一个worker会执行
        };
    }

    taskName = "base task";

    // 是否只允许单个任务同时在跑
    maxRunningCount = 1;

    // subscribe 是真正定时任务执行时被运行的函数
    async subscribe() {
        // 没有启用则不处理任务
        if(this.app.config.task.enable === false) {
            return;
        }

        const option = this.getOption();

        if(option.count > this.maxRunningCount) return;// 执行中，则当前进程不重复

        try {
            option.count += 1;
            // 开始执行
           await this.run();
        }
        catch(e) {
            console.log(e);
        }
        finally {
            option.count -= 1;
        }      
    }

    // 获取当前任务状态
    getOption(): EggTaskOption {
        if(!TaskOptions.has(this.taskName)) {
            TaskOptions.set(this.taskName, {
                status: 0,
                count: 0
            });
        }

        return TaskOptions.get(this.taskName);
    }

    // 任务执行主体，继承的类只要写这个函数即可
    async run() {
        // 任务开始前队列锁，多个线程等待取运行实例
        const taskInstance = await this.ctx.service.taskLock.runLock(TaskLockKeys.task, async (queryInner: QueryRunner) => {
            // 从实例队列中取一个可以执行的
            const instance = await this.ctx.service.taskInstance.getCanOneRun(queryInner);
            if(instance) {
                instance.status = TaskStatus.running;// 把实例标记为正在执行，其它任务不再获取它
                await this.ctx.service.taskInstance.save(instance, queryInner.connection);
            }
            return instance;
        });

        // 事务完后，执行任务
        taskInstance && await this.ctx.service.taskInstance.runTask(taskInstance);// 开始执行
    }
}