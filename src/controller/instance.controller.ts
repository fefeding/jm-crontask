import { Inject, Controller, All, Provide, Body } from '@midwayjs/core';
import { BaseController, decorators } from '@cicctencent/midwayjs-base';
import TaskService from '../service/task';
import TaskInstanceService from '../service/taskInstance';
import { TaskStatus } from '../model/taskConst';

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
    public async get(@Body() params: { id: number }): Promise<any> {
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
    public async updateStatus(
        @Body() params: { id: number; status: TaskStatus }
    ): Promise<any> {
        if (!this.taskInstanceService.checkManager()) {
            throw Error('没有权限');
        }
        return await this.taskInstanceService.updateStatus(
            params.id,
            params.status
        );
    }

    /**
     * 人工终止正在运行的实例
     */
    @All('/kill')
    @decorators.checkApiToken(false)
    @decorators.checkLogin(true)
    public async kill(@Body() params: { id: number }): Promise<any> {
        if (!this.taskInstanceService.checkManager()) {
            throw Error('没有权限');
        }
        if (!params.id) {
            throw Error('请指定实例');
        }
        return await this.taskInstanceService.killInstance(params.id);
    }
}
