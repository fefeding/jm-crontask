
import { QueryRunner } from 'typeorm';
import { TaskLockKeys } from '../model/taskConst';
import BaseTask from './task_base';


// 定时发布资讯
export default class MasterTask extends BaseTask
{
     // 通过 schedule 属性来设置定时任务的执行间隔等配置
    static get schedule() {
        return {
            interval: '10s', // 1 分钟间隔
            type: 'worker', // all 指定所有的 worker 都需要执行,  worker只有一个worker会执行
        };
    }

    taskName = "master task"
    // 最大同时跑任务数
    maxRunningCount = 1;

    async run() {
        // 执行master任务
        const result = await this.ctx.service.taskLock.runLock(TaskLockKeys.master, async (queryInner: QueryRunner) => {
            // 调用任务接口，分享当前可以执行的任务
            return await this.ctx.service.task.initTaskInstance(queryInner);
        });
    }
}