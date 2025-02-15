import { BaseController } from '../base/base.controller';
import TaskService from '../service/task';
import TaskInstanceService from '../service/taskInstance';
import { TaskStatus } from '../model/taskConst';
export declare class TaskInstanceController extends BaseController {
    taskService: TaskService;
    taskInstanceService: TaskInstanceService;
    /**
     * 查询任务实例
     * @param ctx
     */
    query(params: any): Promise<any>;
    /**
     * 查询任务运行记录
     * @param ctx
     */
    get(params: {
        id: number;
    }): Promise<any>;
    /**
     * 更改实例状态
     * @param ctx
     */
    updateStatus(params: {
        id: number;
        status: TaskStatus;
    }): Promise<any>;
}
