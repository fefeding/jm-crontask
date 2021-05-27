import { Context, Controller } from 'egg';
import { decorators } from 'jm-egg-framework';
import TaskConfigOrm from '../model/taskConfig';
import TaskInstanceOrm from '../model/taskInstance';
import { TaskState, TaskStatus } from '../model/taskConst';

export default class InstaceController extends Controller {
    
    /**
     * 查询任务运行记录
     * @param ctx 
     */
    @decorators.checkApiToken(false)
    @decorators.checkApiLogin(true)
    public async query(ctx: Context, params: {
        taskId?: number,
        status?: TaskStatus,
        execStartTime?: string,
        execEndTime?: string,
        size: number,
        page: number,
    }): Promise<any> {
        
        const strWhere = ['Task.id is not null'];
        const whereParams = {} as any;
        if(params.taskId) {
            strWhere.push('and TaskInstance.taskId=:taskId');
            whereParams['taskId'] = params.taskId;
        }
        if(params.status > 0) {
            strWhere.push('and TaskInstance.status = :status');
            whereParams['status'] = params.status;
        }
        if(params.execStartTime) {
            strWhere.push('and TaskInstance.execStartTime >= :execStartTime');
            whereParams['execStartTime'] = params.execStartTime;
        }
        if(params.execEndTime) {
            strWhere.push('and TaskInstance.execStartTime <= :execEndTime');
            whereParams['execEndTime'] = params.execEndTime;
        }

        params.size = Math.min(params.size || 20, 100);
        const skip = ((params.page || 1) - 1) * params.size || 0;

        console.log(params.size, skip);

        const qry = (await ctx.service.taskInstance.getRespository<TaskInstanceOrm>()).createQueryBuilder('TaskInstance')        
                    .leftJoinAndSelect(TaskConfigOrm, 'Task', 'Task.id=TaskInstance.taskId')
                    .select('TaskInstance.id', 'id')
                    .addSelect('TaskInstance.taskId','taskId')
                    .addSelect('TaskInstance.execServer','execServer')
                    .addSelect('TaskInstance.execStartTime','execStartTime')
                    .addSelect('TaskInstance.execEndTime','execEndTime')
                    .addSelect('TaskInstance.status','status')
                    .addSelect('Task.name','taskName')
                    .addSelect('TaskInstance.creator','creator')
                    .addSelect('TaskInstance.updater','updater')
                    .addSelect('TaskInstance.createTime','createTime')
                    .addSelect('TaskInstance.modifyTime','modifyTime')
                    .where(strWhere.join(' '), whereParams)
                    .addOrderBy('TaskInstance.execStartTime', 'DESC')
                    .addOrderBy('TaskInstance.status', 'ASC');

        //console.log(qry.getSql());
        const count = await qry.getCount();
        const data = await qry.limit(params.size).offset(skip).getRawMany();

        const rsp = {
            ret: 0,
            msg: ''
        } as any;
        rsp.data = data;
        rsp.total = count;

        return rsp;
    }

    /**
     * 查询任务运行记录
     * @param ctx 
     */
    @decorators.checkApiToken(false)
    @decorators.checkApiLogin(true)
    public async get(ctx: Context, params: {
        id: number
    }): Promise<any> {       
        
        const rsp = {
            ret: 0,
            msg: ''
        } as any;

        const data = await ctx.service.taskInstance.get(params.id);
        rsp.data = data;

        return rsp;
    }

    /**
     * 更改实例状态
     * @param ctx 
     */
    @decorators.checkApiToken(false)
    @decorators.checkApiLogin(true)
    public async updateStatus(ctx: Context, params: {
        id: number,
        status: TaskStatus
    }): Promise<any> {       
        

        return await ctx.service.taskInstance.updateStatus(params.id, params.status);
    }
}
