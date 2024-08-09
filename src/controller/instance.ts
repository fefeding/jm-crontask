import { Inject, Controller, All, Provide, Body } from '@midwayjs/core';
import { BaseController } from '../base/base.controller';
import TaskService from '../service/task';
import TaskInstanceService from '../service/taskInstance';
import { TaskStatus } from '../model/taskConst';
import * as decorators from '../lib/decorator';

@Provide()
@Controller('/api/instance')
export class TaskInstanceController extends BaseController {
    @Inject()
    taskService: TaskService;
    @Inject()
    taskInstanceService: TaskInstanceService;

    /**
     * 查询任务实例
     * @param ctx 
     */
    @decorators.checkApiToken(false)
    @decorators.checkLogin(true)
    @All('/query')
    public async query(@Body() params: any): Promise<any> {
        
        const res = await this.taskInstanceService.query(params);
        return res;
    }

    /**
     * 查询任务运行记录
     * @param ctx
     */
    @decorators.checkApiToken(false)
    @decorators.checkLogin(true)
    @All('/get')
    public async get(@Body() params: {
        id: number
    }): Promise<any> {
        const data = await this.taskInstanceService.getById(params.id);

        return data;
    }

    /**
     * 更改实例状态
     * @param ctx
     */
    @decorators.checkApiToken(false)
    @decorators.checkLogin(true)
    @All('/updateStatus')
    public async updateStatus(@Body() params: {
        id: number,
        status: TaskStatus
    }): Promise<any> {
        return await this.taskInstanceService.updateStatus(params.id, params.status);
    }
}
