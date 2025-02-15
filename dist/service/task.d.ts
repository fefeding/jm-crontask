import { BaseModel } from '../base/base.model';
import { TaskConfig } from '../model/taskConfig';
import { QueryRunner, Repository } from 'typeorm';
/**
 * 任务
 */
export default class TaskService extends BaseModel<TaskConfig> {
    protected model: Repository<TaskConfig>;
    getById(id: number): Promise<TaskConfig>;
    query(params: any): Promise<{
        data: TaskConfig[];
        total: number;
    }>;
    /**
     * 从当前可以执行的任务中，获取一条。去执行
     */
    getCurrentTimeNeedRunTasks(qryRunner: QueryRunner): Promise<any[]>;
    checkTaskRunTime(task: TaskConfig, qryRunner: QueryRunner): Promise<boolean>;
}
