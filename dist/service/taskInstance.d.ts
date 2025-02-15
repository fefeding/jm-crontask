import { QueryRunner, Repository } from 'typeorm';
import { BaseModel } from '../base/base.model';
import TaskConfigOrm from '../model/taskConfig';
import TaskInstanceOrm from '../model/taskInstance';
import { TaskStatus } from '../model/taskConst';
import TaskService from './task';
/**
 * 任务
 */
export default class TaskInstanceService extends BaseModel<TaskInstanceOrm> {
    protected model: Repository<TaskInstanceOrm>;
    taskService: TaskService;
    createTaskInstance(task: TaskConfigOrm, qryRunner?: QueryRunner, master?: string): Promise<TaskInstanceOrm>;
    getCanOneRun(qryRunner: QueryRunner): Promise<TaskInstanceOrm>;
    stopTimeoutTasks(qryRunner: QueryRunner): Promise<void>;
    /**
     * 执行单个任务
     * @param instance 实例
     * @param db
     */
    runTask(instance: TaskInstanceOrm): Promise<TaskInstanceOrm>;
    getById(id: number): Promise<TaskInstanceOrm>;
    /**
    * 查询任务运行记录
    */
    query(params: {
        taskId?: number;
        status?: TaskStatus;
        execStartTime?: string;
        execEndTime?: string;
        size: number;
        page: number;
    }): Promise<any>;
    /**
     * 修改实例状态
     * @param id 实例
     * @param status 状态
     */
    updateStatus(id: number, status: TaskStatus): Promise<TaskInstanceOrm>;
    clear(endTime: Date): Promise<import("typeorm").DeleteResult>;
    sendFaildMsg(instance: TaskInstanceOrm, msg: string): Promise<any>;
}
