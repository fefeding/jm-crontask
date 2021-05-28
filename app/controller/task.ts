import { Context, Controller } from 'egg';
import { decorators } from 'jm-egg-framework';

import TaskConfigOrm from '../model/taskConfig';
import { TaskConfigPaginationRequest, TaskConfigPaginationResponse, TaskConfigSaveRequest, TaskConfigSaveResponse} from '../model/task';
import { TaskState } from '../model/taskConst';
import { EValid } from '../model/interface/enumType';

export default class TaskController extends Controller {
    
    /**
     * 查询任务配置
     * @param ctx 
     */
    @decorators.checkApiToken(false)
    @decorators.checkApiLogin(true)
    public async query(ctx: Context, params: TaskConfigPaginationRequest): Promise<TaskConfigPaginationResponse> {
        
        const strWhere = ['1=1'];
        const whereParams = {} as any;
        if(params.name) {
            strWhere.push('and TaskConfig.name like :name');
            whereParams['name'] = `%${params.name}%`;
        }
        if(params.timeSize) {
            strWhere.push('and TaskConfig.timeSize = :timeSize');
            whereParams['timeSize'] = params.timeSize;
        }
        if(params.state > 0) {
            strWhere.push('and TaskConfig.state = :state');
            whereParams['state'] = params.state;
        }
        if(params.id > 0) {
            strWhere.push('and TaskConfig.id = :id');
            whereParams['id'] = params.id;
        }

        params.size = Math.min(params.size || 20, 100);
        const skip = ((params.page || 1) - 1) * params.size || 0;

        const qry = (await ctx.service.task.getRespository<TaskConfigOrm>()).createQueryBuilder('TaskConfig')
                    .where(strWhere.join(' '), whereParams)
                    .addOrderBy('TaskConfig.state', 'ASC').addOrderBy('TaskConfig.lastRunTime', 'DESC')
                    .skip(skip).take(params.size);

        //console.log(qry.getSql());
        const [data , count] = await qry.getManyAndCount();

        const rsp = new TaskConfigPaginationResponse();
        rsp.data = data;
        rsp.total = count;

        return rsp;
    }

    @decorators.checkApiToken(false)
    @decorators.checkApiLogin(true)
    public async save(ctx: Context, data: TaskConfigSaveRequest) {
        const rsp = new TaskConfigSaveResponse();

        const qry = (await ctx.service.task.getRespository<TaskConfigOrm>()).createQueryBuilder();

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
        
        fields['updater'] = ctx.currentSession.user.staffId.toString();

        if(data.id > 0) {
            const up = qry.update(TaskConfigOrm).set(fields).where("id=:id", {id: data.id});
            rsp.data = await up.execute();
        }
        else {
            fields['description'] = fields['description'] || '';
            fields['creator'] = fields['updater'];
            rsp.data = await qry.insert().into(TaskConfigOrm).values(fields).execute();
        }
        return rsp;
    }

    @decorators.checkApiToken(false)
    @decorators.checkApiLogin(true)
    public async setState(ctx: Context, data: {
        id: number,
        state: TaskState
    }) {

        const qry = (await ctx.service.task.getRespository<TaskConfigOrm>()).createQueryBuilder('task');

        const fields = {} as any;
        if(data.state) {
            fields['state'] = data.state;
        }        

        if(data.id > 0) {
            const task = await qry.where('task.id=:id', {id: data.id}).getOne();
            if(!task) {
                throw Error('指定的任务不存在');
            }
            switch(data.state) {
                case TaskState.init: {                    
                    throw Error('不能回到初始化'); 
                }
            }

            const up = qry.update(TaskConfigOrm).set(fields).where("id=:id", {id: data.id});
            return await up.execute();
        }
        else {
            throw Error('请指定要修改的任务');
        }
    }

    
    // 给任务立即执行一次，
    @decorators.checkApiToken(false)
    @decorators.checkApiLogin(true)
    public async run(ctx: Context, data: {
        id: number
    }) {       

        if(!data.id) {
            throw new Error('请指定任务');
        }

        const qry = await (await ctx.service.task.getConnection()).createQueryRunner();
        try {
            const task = await ctx.service.task.get(data.id);
            //console.log(task);

            if(task && task.state === TaskState.start && task.valid == EValid.Valid) {
                const res = await ctx.service.task.createTaskInstance(task, qry);
                return res;
            }
            else {
                throw new Error('任务不存在或未启用');
            }
        }
        catch(e) {
            throw e;
        }
        finally {
            await qry.release();
        }
    }
}
