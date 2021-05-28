import * as vm from 'vm';
import * as moment from 'moment';
import { Context } from 'egg';
import * as ip from 'ip';

//const tarsConfig = require('@jv/egg-jv-common/lib/tarsConfig.js');

import { BaseTypeService } from './base';

import TaskConfigOrm from '../model/taskConfig';

import TaskInstanceOrm from '../model/taskInstance';
import { Connection, QueryRunner } from 'typeorm';
import { TaskStatus } from '../model/taskConst';

/**
 * 任务
 */
export default class TaskInstanceService extends BaseTypeService<TaskInstanceOrm> {
    constructor(ctx: Context) {
        super(ctx, TaskInstanceOrm);
    }

    // 创建新的任务实例
    async createInstance(instance: TaskInstanceOrm, qryRunner: QueryRunner) {
        
        instance.createTime = instance.modifyTime = new Date();

        return await this.save(instance, qryRunner.connection);
    }

    // 从实例队列中取一个可以执行的实例
    async getCanOneRun(qryRunner: QueryRunner) {
        const queryBuilder = (await this.getRespository<TaskInstanceOrm>()).createQueryBuilder('instance', qryRunner);
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
    async runTask(instance: TaskInstanceOrm, db?: Connection) {

        // 发布脚本中的console托管。记录日志
        const vconsole = {
            info: (...args) => {
                console.info(...args);
                instance.log += `[info] ${args.map((v)=>typeof v ==='object'? JSON.stringify(v):v).join('\n')}\n`;
            },
            log: (...args) => {
                console.log(...args);
                instance.log += `[info] ${args.map((v)=>typeof v ==='object'? JSON.stringify(v):v).join('\n')}\n`;
            },
            error: (...args) => {
                console.error(...args);
                instance.log += `[error] ${args.map((v)=>typeof v ==='object'? JSON.stringify(v):v).join('\n')}\n`;
            },
            debug: (...args) => {
                console.debug(...args);
                instance.log += `[debug] ${args.map((v)=>typeof v ==='object'? JSON.stringify(v):v).join('\n')}\n`;
            }
        };

        try {
            instance.execStartTime = moment().format('YYYY-MM-DD HH:mm:ss');
            instance.execServer = ip.address();

            const task = await this.ctx.service.task.get(instance.taskId, db);
            if(!task) {
                throw Error(`任务配置${instance.taskId}不存在`);
            } 
            
            task.lastRunTime = instance.execStartTime;
            await this.service.task.save(task, db);

            this.ctx.task = task;// 把当前任务配置带到ctx内
            //this.ctx.tarsConfig = tarsConfig;

            const options = {
                params: {
                    "console": vconsole,
                    "ctx": this.ctx,
                    //"tarsConfig": tarsConfig,
                    moment
                }
            }
            vconsole.info(task.name);
            const res = await this.runScript(task.script, options);
            vconsole.info(res);
            instance.status = TaskStatus.success;
        }
        catch(e) {
            console.log(e);
            vconsole.error(`${e.toString()}`);
            instance.status = TaskStatus.failed;

            // 失败发送消息
            this.sendFaildMsg(instance, e.message || e);
        }

        instance.execEndTime = moment().format('YYYY-MM-DD HH:mm:ss');

        vconsole.info(moment().format('HH:mm:ss'));

        await this.save(instance, db); // 保存日志
    }

    // 运行一个函数脚本，动态提供参数
    async runScript(code, options) {
        options = options || {};
        const paramNames = [];// 函数参数名，
        const paramValues = []; // 函数调用参数值
        if(options.params) {
            for(let k in options.params) {
                if(typeof k !== 'string') continue;
                paramNames.push(k);
                paramValues.push(options.params[k]);
            }
        }

        const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
        const fun = new AsyncFunction(...paramNames, code);
        //const fun = (new Function('AsyncFunction', 'code', `return new AsyncFunction("${paramNames.join('","')}", code)`))(AsyncFunction, code);

        const res = await fun.call(this, ...paramValues);
        return res;
    }

    /**
     * 修改实例状态
     * @param id 实例
     * @param status 状态
     */
    async updateStatus(id: number, status: TaskStatus) {
        const instance = await this.get(id);
        instance.status = status;

        return await this.save(instance);
    }

    // 发送失败消息
    async sendFaildMsg(instance: TaskInstanceOrm, msg: string) {
        try {
            // 测试环境不处理消息
            if(this.ctx.app.config.jvCommon && this.ctx.app.config.jvCommon.env === 'test') return;

            const task = await this.ctx.service.task.get(instance.taskId);

            const data = {
                //"touser" : "fefeding",
                "toStaff": task.watcher || task.creator,
                //"toparty" : "PartyID1|PartyID2",
                //"totag" : "TagID1 | TagID2",               
                "title": task.name + ` 任务执行失败`,
                "content" : msg,
                "url": `${this.ctx.app.config.watcher.logUrl}${instance.id}`,
                "btntxt": "查看详情"
            }
            //console.log(data);
            // 发送一个机器人消息
            this.ctx.helper.postTaskMessage(data);
            //const rsp = await this.ctx.sendWKMsg(data);
            // console.log(rsp);
            //return rsp;
        }
        catch(e) {
            console.log(e);
        }
    }

}