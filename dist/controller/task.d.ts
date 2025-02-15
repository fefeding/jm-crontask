import { BaseController } from '../base/base.controller';
import TaskService from '../service/task';
import TaskInstanceService from '../service/taskInstance';
import { TaskState } from '../model/taskConst';
import TaskConfigOrm from '../model/taskConfig';
export declare class TaskController extends BaseController {
    taskService: TaskService;
    taskInstanceService: TaskInstanceService;
    /**
     * 查询任务配置
     * @param ctx
     */
    query(params: any): Promise<any>;
    save(data: any): Promise<TaskConfigOrm | TaskConfigOrm[]>;
    setState(data: {
        id: number;
        state: TaskState;
    }): Promise<TaskConfigOrm>;
    run(data: {
        id: number;
    }): Promise<import("../model/taskInstance").default>;
}
