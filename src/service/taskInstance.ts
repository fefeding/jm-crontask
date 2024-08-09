import * as moment from 'moment';
import { Provide, Inject, Scope, ScopeEnum } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import * as stream from 'stream';
import * as fs from 'fs';
import * as jsruntime from 'jm-jsruntime';
import { BaseModel } from '../base/base.model';

import TaskConfigOrm from '../model/taskConfig';

import TaskInstanceOrm from '../model/taskInstance';
import { TaskStatus } from '../model/taskConst';
import TaskService from './task';

/**
 * 任务
 */
@Provide()
@Scope(ScopeEnum.Request, { allowDowngrade: true })
export default class TaskInstanceService extends BaseModel<TaskInstanceOrm> {

    @InjectEntityModel(TaskInstanceOrm)
    protected model: Repository<TaskInstanceOrm>;

    @Inject()
    taskService : TaskService;

    // 通过任务配置创建实例
    async createTaskInstance(task: TaskConfigOrm, qryRunner?: QueryRunner, master: string = '') {
        const instance = new TaskInstanceOrm();
        instance.taskId = task.id;

        const user = this.ctx?.currentSession?.loginId || 'task';
        instance.creator = instance.updater = master || user; // 如果执行人为 system 表示自动执行的，否则是手工执行的

        // 创建实例
        console.log('create task instance ', task);

        instance.createTime = instance.modifyTime = new Date();

        if(!qryRunner) qryRunner = this.model.manager.queryRunner || this.model.manager.connection.createQueryRunner();

        return await qryRunner.connection.getRepository(TaskInstanceOrm).save(instance);
    }

    // 从实例队列中取一个可以执行的实例
    async getCanOneRun(qryRunner: QueryRunner) {
        const queryBuilder = this.model.createQueryBuilder('instance', qryRunner);
        const qry = queryBuilder.where('instance.status=:status', {
            status: TaskStatus.init
        }).take(1);

        const instance = await qry.getOne();

        return instance;
    }

    /**
     * 执行单个任务
     * @param instance 实例
     * @param db
     */
    async runTask(instance: TaskInstanceOrm) {
        // const logger = this.ctx.logger;
        const logger = this.ctx.log;
        // 发布脚本中的console托管。记录日志
        const vconsole = {
            write: (type, msgs)=>{
                try {
                    console.info(type, msgs);
                    msgs = msgs || [];
                    const log =  `[${type}][${instance.id}] ${msgs.map((v)=>typeof v ==='object'? JSON.stringify(v):v).join('\n')}\n`;

                    if(instance.log?.length > 1000){
                        instance.log = instance.log.substring(0,1000) + `\n 更多日志请移步es查询包含[${instance.id}]`;
                    }
                    else {
                        instance.log += log;
                    }

                    logger && logger[type] && (logger[type](log));
                }
                catch(e) {
                    console.error(e);
                    this.ctx?.log?.error('vconsole write error:',e)
                }
            },
            info: (...args) => {
                vconsole.write('info', args);
            },
            log: (...args) => {
                vconsole.write('info', args);
            },
            error: (...args) => {
                vconsole.write('error', args);
            },
            debug: (...args) => {
                vconsole.write('debug', args);
            }
        };

        try {

            const task = await this.taskService.getById(instance.taskId);
            if(!task) {
                throw Error(`任务配置${instance.taskId}不存在`);
            }

            task.lastRunTime = instance.execStartTime;
            await this.taskService.save(task);

            const options = {
                params: {
                    "console": vconsole,
                    "task": task,
                    moment,
                    stream,
                    fs,
                }
            }
            vconsole.info(task.name);
            const res = await jsruntime.runScript(task.script, options);
            vconsole.info(res);
            instance.status = TaskStatus.success;
        }
        catch(e) {
            console.log(e);
            vconsole.error(e.toString());
            instance.status = TaskStatus.failed;
        }

        instance.execEndTime = moment().format('YYYY-MM-DD HH:mm:ss');

        vconsole.info(moment().format('HH:mm:ss'));

        return await this.save(instance); // 保存日志
    }

    // 通过ID获取
    async getById(id: number) {
        const task = await this.model.findOneBy({
            id
        });
        return task;
    }

     /**
     * 查询任务运行记录
     */
     async query(params: {
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
 
         const qry = this.model.createQueryBuilder('TaskInstance')
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
         //const count = await qry.getCount();
         const data = await qry.limit(params.size).offset(skip).getRawMany();
 
         return data;
     }

    /**
     * 修改实例状态
     * @param id 实例
     * @param status 状态
     */
    async updateStatus(id: number, status: TaskStatus) {
        const instance = await this.model.findOneBy({
            id
        });
        instance.status = status;

        return await this.save(instance);
    }

    // 清除指定时间前的实例
    async clear(endTime: Date) {
        const queryBuilder = this.model.createQueryBuilder();
        const qry = queryBuilder.where('Fcreate_time<=:endTime and Fstatus>1', {
            endTime
        }).delete();
        const sql = qry.getSql();
        console.log(sql);
        return await qry.execute();
    }

    // 发送失败消息
    async sendFaildMsg(instance: TaskInstanceOrm, msg: string) {
        try {

            const task = await this.ctx.service.task.get(instance.taskId);

            const data = {
                //"touser" : "fefeding",
                "toStaff": task.watcher || task.creator,
                //"toparty" : "PartyID1|PartyID2",
                //"totag" : "TagID1 | TagID2",
                "title": task.name + ` 任务执行失败`,
                "content" : msg,
                //"url": `${this.ctx.app.config.watcher.logUrl}${instance.id}`,
                "btntxt": "查看详情"
            }
            //console.log(data);
            // 发送一个机器人消息
            this.ctx.helper.postTaskMessage(data);
            const rsp = await this.ctx.sendWKMsg(data);
            // console.log(rsp);
            return rsp;
        }
        catch(e) {
            console.log(e);
            this.ctx.log.error('sendFaildMsg Error:',e)
        }
    }

}
