import { Provide, Scope, ScopeEnum } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import * as moment from 'moment';
import { BaseModel } from '../base/base.model';
import { TaskConfig } from '../model/taskConfig';
import { TaskInstance } from '../model/taskInstance';
import { TaskState, TaskTimeSize } from '../model/taskConst';
import { QueryRunner, Repository } from 'typeorm';
const parser = require('@hardik_sharma/cron-parser-all');

/**
 * 任务
 */
@Provide()
@Scope(ScopeEnum.Request, { allowDowngrade: true })
export default class TaskService extends BaseModel<TaskConfig> {

    @InjectEntityModel(TaskConfig)
    protected model: Repository<TaskConfig>;

    // 通过ID获取
    async getById(id: number) {
        const task = await this.model.findOneBy({
            id
        });
        return task;
    }

    // 检索
    async query(params: any) {
        
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

        const qry = this.model.createQueryBuilder('TaskConfig')
                    .where(strWhere.join(' '), whereParams)
                    .addOrderBy('TaskConfig.state', 'ASC').addOrderBy('TaskConfig.lastRunTime', 'DESC')
                    .skip(skip).take(params.size);

        //console.log(qry.getSql());
        const [data , count] = await qry.getManyAndCount();

        const rsp = {
            data,
            total: count
        };

        return rsp;
    }

    /**
     * 从当前可以执行的任务中，获取一条。去执行
     */
    async getCurrentTimeNeedRunTasks(qryRunner: QueryRunner) {
        
            //console.log(`查询是否有需要执行的任务`);
            
            const queryBuilder = this.model.createQueryBuilder('task', qryRunner);

            // 上一秒处理过的先不处理
            const taskQry = queryBuilder
                // 关联是否有实例在执行或已创建，这个tick不重复创建，直接任务执行完成。
                .leftJoin(TaskInstance, 'taskInstance', "taskInstance.taskId=task.id and taskInstance.Fvalid=1 and taskInstance.status in (0,1)")
                .where("taskInstance.id is null and task.state=:state and task.Fvalid=1", {state: TaskState.start});

            //const sql = taskQry.getSql();

            //console.log('get task sql', sql);

            const tasks = await taskQry.getMany();

            const result = [];
            if(tasks) {                
                for(const task of tasks) {
                    const ret = await this.checkTaskRunTime(task, qryRunner);
                    if(ret === true) result.push(task);
                }
                
            }
            return result;
    }

    // 处理当前任务在当前时间是否需要执行
    async checkTaskRunTime(task: TaskConfig, qryRunner: QueryRunner) {
        try {
            //console.log(task);
            if(!task.timeValue) {
                console.log('配置的时间不正确');
                return;
            }
            // 如果是单次执行，则判断其时间符合即可
            if(task.timeSize === TaskTimeSize.single) {
                const time = moment(task.timeValue);                

                // 哪果单次执行时间格式不对，则不处理
                if(!time.isValid) {
                    console.log(task.id + ', 错误的时间格式');
                    return;
                }
                // 如果已到时间，则执行它
                if(time.isBefore()) {

                    // 哪果是单次执行的，则生成实例后就不再需要这个配置了
                    task.state =TaskState.disabled;// 移除
                    await qryRunner.connection.getRepository(TaskConfig).save(task);
                    return true;
                }
            }
            else {
                let nextRunTime = Date.now(); // 下次执行时间
                const now = moment();// 当前时间
                const lastRunTime = moment(task.lastRunTime || '1900-01-01 00:00:00');
                // 根据类型，判断当前时间是否需要执行
                switch(task.timeSize) {
                    case TaskTimeSize.second: {
                        nextRunTime = lastRunTime.valueOf() + Number(task.timeValue) * 1000;// 每隔多少秒执行
                        // 到可以执行时间了
                        if(nextRunTime <= Date.now()) {
                            return true;
                        }
                        break;
                    }
                    case TaskTimeSize.minute: {
                        nextRunTime = lastRunTime.valueOf() + Number(task.timeValue) * 1000 * 60;// 每隔多少秒执行
                        // 到可以执行时间了
                        if(nextRunTime <= Date.now()) {
                            return true;
                        }
                        break;
                    }
                    case TaskTimeSize.hour: {
                        nextRunTime = lastRunTime.valueOf() + Number(task.timeValue) * 1000 * 60 * 60;// 每隔多少秒执行
                        // 到可以执行时间了
                        if(nextRunTime <= Date.now()) {
                            return true;
                        }
                        break;
                    }
                    // 按天的话会指定每天几点执行  hh:mm:ss
                    case TaskTimeSize.day: {
                        const timeValue = moment(task.timeValue, 'HH:mm:ss');
                        // 如果单次执行时间格式不对，则不处理
                        if(!timeValue.isValid) {
                            console.log(task.id + ', 错误的时间格式');
                            return;
                        }

                        // 今天没执行过，且时间到点了
                        const time = timeValue.format('HH:mm:ss');
                        const nowtime = now.format('HH:mm:ss');
                        //console.log(lastRunTime.format('YYYY-MM-DD HH:mm:ss'), time, nowtime);

                        if(!(lastRunTime.year() === now.year() && lastRunTime.month() === now.month() && lastRunTime.day() === now.day()) &&
                                time <= nowtime) {
                                    return true;
                        }
                        break;
                    }
                    // 按周
                    case TaskTimeSize.week: {
                        
                        break;
                    }
                    case TaskTimeSize.month: {
                        
                        break;
                    }
                    // 按照定时规则
                    case TaskTimeSize.crontab: {
                        // 先解析表达式
                        try {
                            let options = {
                                currentDate: moment(lastRunTime).format('YYYY-MM-DD HH:mm:ss'),
                                tz: 'Asia/Shanghai'
                            }

                            // let crontabArr = task.timeValue.split(' ');

                            // 7位定时规则表达式处理
                            // if(crontabArr.length === 7) {
                            //     if(crontabArr[0] === '*') {
                            //         crontabArr[0] = '0';
                            //     }
                            //     if(crontabArr[1] === '*') {
                            //         crontabArr[1] = '0';
                            //     }
                            // }

                            const interval = parser.parseExpression(task.timeValue, options);
                            const nextTimer = interval.next().toString();   // 下次执行时间
                            const prevTimer = interval.prev().toString();   // 上次执行时间
                            // console.log('interval:',task.timeValue, nextTimer, prevTimer, lastRunTime, now);

                            // 到了本次的执行时间
                            if(moment(lastRunTime).isSameOrAfter(new Date(prevTimer))
                            && moment(new Date(nextTimer)).isSameOrBefore(now)) {
                                console.log('定时器开始任务：',task.id);
                                return true;
                            }
                        } catch (error) {
                            console.log('解析定时任务表达式失败: ' + (error.message as any));
                            return;
                        }
                        break;
                    }
                }
            } 
        }
        catch(e) {
            console.log(e);
            this.ctx.log.error('checkTaskRunTime error:',e)
        }
    }   
}