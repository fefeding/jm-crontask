import { Inject, Controller, All, Provide, Body } from '@midwayjs/core';
import { BaseController } from '../base/base.controller';
import TaskService from '../service/task';
import TaskInstanceService from '../service/taskInstance';
import { TaskState } from '../model/taskConst';
import TaskConfigOrm from '../model/taskConfig';
import * as decorators from '../lib/decorator';
import { EValid } from '@fefeding/common/dist/models/base/enumType';

@Provide()
@Controller('/api/task')
export class TaskController extends BaseController {
    @Inject()
    taskService: TaskService;
    @Inject()
    taskInstanceService: TaskInstanceService;

    /**
     * 查询任务配置
     * @param ctx 
     */
    @decorators.checkApiToken(false)
    @decorators.checkLogin(true)
    @All('/query')
    public async query(@Body() params: any): Promise<any> {
        
        const res = await this.taskService.query(params);
        return res;
    }

    @decorators.checkApiToken(false)
    @decorators.checkLogin(true)
    @All('/save')
    public async save(@Body() data: any) {

        const fields = {} as any;
        if(data.name) {
            fields['name'] = data.name;
        }
        if(data.description) {
            fields['description'] = data.description;
        }
        if(typeof data.timeSize !== 'undefined') {
            fields['timeSize'] = data.timeSize;
        }
        if(data.timeValue) {
            fields['timeValue'] = data.timeValue;
        }
        if(data.script) {
            fields['script'] = data.script;
        } 
        if(data.watcher) {
            fields['watcher'] = data.watcher;
        } 
        if(data.id > 0) {
            const task = await this.taskService.getById(data.id);
            if(!task) throw Error('任务不存在');
            task.fromJSON(data);// 写入改变
            const res = await this.taskService.save(task);
            return res;
        }
        else {
            fields['description'] = fields['description'] || '';
            fields['creator'] = fields['updater'];
            const task = new TaskConfigOrm(fields);
            const res = await this.taskService.insert(task);
            return res;
        }
    }

    
    @All('/setState')
    @decorators.checkApiToken(false)
    @decorators.checkLogin(true)
    public async setState(@Body() data: {
        id: number,
        state: TaskState
    }) {        

        if(data.id > 0) {
            const task = await this.taskService.getById(data.id);
            if(!task) {
                throw Error('指定的任务不存在');
            }
            switch(data.state) {
                case TaskState.init: {                    
                    throw Error('不能回到初始化'); 
                }
            }
            task.state = data.state;
            return await this.taskService.update(task);
        }
        else {
            throw Error('请指定要修改的任务');
        }
    }

    
    // 给任务立即执行一次，
    @All('/run')
    @decorators.checkApiToken(false)
    @decorators.checkLogin(true)
    public async run(@Body() data: {
        id: number
    }) {       

        if(!data.id) {
            throw new Error('请指定任务');
        }

        try {
            const task = await this.taskService.getById(data.id);
            //console.log(task);

            if(task && task.state === TaskState.start && task.valid == EValid.Valid) {
                const res = await this.taskInstanceService.createTaskInstance(task);
                return res;
            }
            else {
                throw new Error('任务不存在或未启用');
            }
        }
        catch(e) {
            throw e;
        }
    }
}
