import * as vm from 'vm';
import * as moment from 'moment';
import { Context } from 'egg';
import { BaseTypeService } from './base';

import TaskConfigOrm from '../model/taskConfig';

import TaskInstanceOrm from '../model/taskInstance';
import { Connection, QueryRunner } from 'typeorm';
import { EValid } from '../model/interface/enumType';
import { TaskLockKeys, TaskState, TaskTimeSize } from '../model/taskConst';
import TaskLockOrm from '../model/taskLock';

/**
 * 任务
 */
export default class TaskService extends BaseTypeService<TaskConfigOrm> {
    constructor(ctx: Context) {
        super(ctx, TaskConfigOrm);
    }

    /**
     * 从当前可以执行的任务中，获取一条。去执行
     */
    async initTaskInstance(qryRunner: QueryRunner) {
        
            //console.log(`查询是否有需要执行的任务`);
            
            const queryBuilder = (await this.getRespository<TaskConfigOrm>()).createQueryBuilder('task', qryRunner);

            // 上一秒处理过的先不处理
            const taskQry = queryBuilder
                // 关联是否有实例在执行或已创建，这个tick不重复创建，直接任务执行完成。
                .leftJoin(TaskInstanceOrm, 'taskInstance', "taskInstance.taskId=task.id and taskInstance.Fvalid=1 and taskInstance.status in (0,1)")
                .where("taskInstance.id is null and task.state=:state and task.Fvalid=1", {state: TaskState.start});

            //const sql = taskQry.getSql();

            //console.log('get task sql', sql);

            const tasks = await taskQry.getMany();

            if(tasks) {
                            
                //console.log('获得', tasks);
                
                for(const task of tasks) {
                    await this.checkTaskRunTime(task, qryRunner);
                }
                
            }
        
    }

    // 处理当前任务在当前时间是否需要执行
    async checkTaskRunTime(task: TaskConfigOrm, qryRunner: QueryRunner) {
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

                    await this.createTaskInstance(task, qryRunner);
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
                            await this.createTaskInstance(task, qryRunner);
                        }
                        break;
                    }
                    case TaskTimeSize.minute: {
                        nextRunTime = lastRunTime.valueOf() + Number(task.timeValue) * 1000 * 60;// 每隔多少秒执行
                        // 到可以执行时间了
                        if(nextRunTime <= Date.now()) {
                            await this.createTaskInstance(task, qryRunner);
                        }
                        break;
                    }
                    case TaskTimeSize.hour: {
                        nextRunTime = lastRunTime.valueOf() + Number(task.timeValue) * 1000 * 60 * 60;// 每隔多少秒执行
                        // 到可以执行时间了
                        if(nextRunTime <= Date.now()) {
                            await this.createTaskInstance(task, qryRunner);
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
                            await this.createTaskInstance(task, qryRunner, 'system');
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
                }
            }  
            
            await this.save(task, qryRunner.connection);
        }
        catch(e) {
            console.log(e);
        }
    }

    async createTaskInstance(task: TaskConfigOrm, qryRunner: QueryRunner, master: string = '') {
        const instance = new TaskInstanceOrm();
        instance.taskId = task.id;

        const user = this.ctx.currentSession && this.ctx.currentSession.user? this.ctx.currentSession.user.staffId.toString() : 'task';
        instance.creator = instance.updater = master || user; // 如果执行人为 system 表示自动执行的，否则是手工执行的

        // 创建实例
        const res = await this.ctx.service.taskInstance.createInstance(instance, qryRunner);

        console.log('create task instance ', task.id);

        return res;
    }

    // 等待一定时间
    async sleep(time: number = 10) {
        return new Promise<void>((resolve, reject) => {
            setTimeout(()=>{
                resolve();
            }, time);
        });
    }
}