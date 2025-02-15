"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const core_1 = require("@midwayjs/core");
const typeorm_1 = require("@midwayjs/typeorm");
const typeorm_2 = require("typeorm");
const path = require("path");
const jsruntime = require("jm-jsruntime");
const axios_1 = require("axios");
const base_model_1 = require("../base/base.model");
const taskConfig_1 = require("../model/taskConfig");
const taskInstance_1 = require("../model/taskInstance");
const taskConst_1 = require("../model/taskConst");
const task_1 = require("./task");
/**
 * 任务
 */
let TaskInstanceService = class TaskInstanceService extends base_model_1.BaseModel {
    model;
    taskService;
    // 通过任务配置创建实例
    async createTaskInstance(task, qryRunner, master = '') {
        const instance = new taskInstance_1.default();
        instance.taskId = task.id;
        const user = this.ctx?.currentSession?.loginId || 'task';
        instance.creator = instance.updater = master || user; // 如果执行人为 system 表示自动执行的，否则是手工执行的
        // 创建实例
        //console.log('create task instance ', task);
        instance.createTime = instance.modifyTime = new Date();
        if (!qryRunner)
            qryRunner = this.model.manager.queryRunner || this.model.manager.connection.createQueryRunner();
        return await qryRunner.connection.getRepository(taskInstance_1.default).save(instance);
    }
    // 从实例队列中取一个可以执行的实例
    async getCanOneRun(qryRunner) {
        const queryBuilder = this.model.createQueryBuilder('instance', qryRunner);
        const qry = queryBuilder.where('instance.status=:status', {
            status: taskConst_1.TaskStatus.init
        }).take(1);
        const instance = await qry.getOne();
        return instance;
    }
    // 终结所有超时的实例
    async stopTimeoutTasks(qryRunner) {
        try {
            const queryBuilder = this.model.createQueryBuilder('instance', qryRunner);
            const qry = queryBuilder
                // 关联是否有实例在执行或已创建，这个tick不重复创建，直接任务执行完成。
                .leftJoin(taskConfig_1.default, 'taskConfig', `taskConfig.id=instance.taskId`)
                .where(`instance.status=:status and taskConfig.Ftimeout > 0 and instance.execStartTime < DATE_FORMAT(DATE_SUB(NOW(), INTERVAL taskConfig.Ftimeout SECOND), '%Y-%m-%d %H:%i:%s')`, {
                status: taskConst_1.TaskStatus.running
            });
            const items = await qry.getMany();
            if (items.length) {
                for (const item of items) {
                    item.status = taskConst_1.TaskStatus.timeout;
                    const res = await this.model.save(item);
                    this.sendFaildMsg(res, '执行超时');
                }
            }
        }
        catch (e) {
            console.error(e);
        }
    }
    /**
     * 执行单个任务
     * @param instance 实例
     * @param db
     */
    async runTask(instance) {
        // const logger = this.ctx.logger;
        const logger = this.ctx.log;
        // 发布脚本中的console托管。记录日志
        const vconsole = {
            write: (type, msgs) => {
                try {
                    //console.info(type, msgs);
                    msgs = msgs || [];
                    const log = `[${type}][${instance.id}] ${msgs.map((v) => typeof v === 'object' ? JSON.stringify(v) : v).join('\n')}\n`;
                    if (instance.log?.length > 1000) {
                        instance.log = instance.log.substring(0, 1000) + `\n 更多日志请移步es查询包含[${instance.id}]`;
                    }
                    else {
                        instance.log += log;
                    }
                    logger && logger[type] && (logger[type](log));
                }
                catch (e) {
                    console.error(e);
                    this.ctx?.log?.error('vconsole write error:', e);
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
            if (!task) {
                throw Error(`任务配置${instance.taskId}不存在`);
            }
            task.lastRunTime = instance.execStartTime;
            await this.taskService.save(task);
            const options = {
                promise: true,
                params: {
                    "console": vconsole,
                    "require": () => {
                        throw Error('不支持require');
                    },
                    'process': null,
                    "task": task,
                    // 等待一定时间
                    "sleep": async (time = 10) => {
                        //time = Math.min(time, 20000);// 最多支持等待时间
                        return new Promise((resolve, reject) => {
                            setTimeout(() => {
                                resolve();
                            }, time);
                        });
                    },
                    "modules": {
                        moment,
                        path,
                        axios: axios_1.default,
                    }
                }
            };
            vconsole.info('开始执行', task.name);
            const res = await jsruntime.runScript(task.script, options);
            vconsole.info(res, '结束');
            instance.status = taskConst_1.TaskStatus.success;
        }
        catch (e) {
            console.log(e);
            vconsole.error(e.toString());
            instance.status = taskConst_1.TaskStatus.failed;
        }
        instance.execEndTime = moment().format('YYYY-MM-DD HH:mm:ss');
        vconsole.info(moment().format('HH:mm:ss'));
        return await this.save(instance); // 保存日志
    }
    // 通过ID获取
    async getById(id) {
        const task = await this.model.findOneBy({
            id
        });
        return task;
    }
    /**
    * 查询任务运行记录
    */
    async query(params) {
        const strWhere = ['Task.id is not null'];
        const whereParams = {};
        if (params.taskId) {
            strWhere.push('and TaskInstance.taskId=:taskId');
            whereParams['taskId'] = params.taskId;
        }
        if (params.status > 0) {
            strWhere.push('and TaskInstance.status = :status');
            whereParams['status'] = params.status;
        }
        if (params.execStartTime) {
            strWhere.push('and TaskInstance.execStartTime >= :execStartTime');
            whereParams['execStartTime'] = params.execStartTime;
        }
        if (params.execEndTime) {
            strWhere.push('and TaskInstance.execStartTime <= :execEndTime');
            whereParams['execEndTime'] = params.execEndTime;
        }
        params.size = Math.min(params.size || 20, 100);
        const skip = ((params.page || 1) - 1) * params.size || 0;
        console.log(params.size, skip);
        const qry = this.model.createQueryBuilder('TaskInstance')
            .leftJoinAndSelect(taskConfig_1.default, 'Task', 'Task.id=TaskInstance.taskId')
            .select('TaskInstance.id', 'id')
            .addSelect('TaskInstance.taskId', 'taskId')
            .addSelect('TaskInstance.execServer', 'execServer')
            .addSelect('TaskInstance.execStartTime', 'execStartTime')
            .addSelect('TaskInstance.execEndTime', 'execEndTime')
            .addSelect('TaskInstance.status', 'status')
            .addSelect('Task.name', 'taskName')
            .addSelect('TaskInstance.creator', 'creator')
            .addSelect('TaskInstance.updater', 'updater')
            .addSelect('TaskInstance.createTime', 'createTime')
            .addSelect('TaskInstance.modifyTime', 'modifyTime')
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
    async updateStatus(id, status) {
        const instance = await this.model.findOneBy({
            id
        });
        instance.status = status;
        return await this.save(instance);
    }
    // 清除指定时间前的实例
    async clear(endTime) {
        const queryBuilder = this.model.createQueryBuilder();
        const qry = queryBuilder.where('Fcreate_time<=:endTime and Fstatus>1', {
            endTime
        }).delete();
        const sql = qry.getSql();
        console.log(sql);
        return await qry.execute();
    }
    // 发送失败消息
    async sendFaildMsg(instance, msg) {
        try {
            const task = await this.ctx.service.task.get(instance.taskId);
            const data = {
                //"touser" : "fefeding",
                "toStaff": task.watcher || task.creator,
                //"toparty" : "PartyID1|PartyID2",
                //"totag" : "TagID1 | TagID2",
                "title": task.name + ` 任务执行失败`,
                "content": msg,
                //"url": `${this.ctx.app.config.watcher.logUrl}${instance.id}`,
                "btntxt": "查看详情"
            };
            //console.log(data);
            // 发送一个机器人消息
            this.ctx.helper.postTaskMessage(data);
            const rsp = await this.ctx.sendWKMsg(data);
            // console.log(rsp);
            return rsp;
        }
        catch (e) {
            console.log(e);
            this.ctx.log.error('sendFaildMsg Error:', e);
        }
    }
};
__decorate([
    (0, typeorm_1.InjectEntityModel)(taskInstance_1.default),
    __metadata("design:type", typeorm_2.Repository)
], TaskInstanceService.prototype, "model", void 0);
__decorate([
    (0, core_1.Inject)(),
    __metadata("design:type", task_1.default)
], TaskInstanceService.prototype, "taskService", void 0);
TaskInstanceService = __decorate([
    (0, core_1.Provide)(),
    (0, core_1.Scope)(core_1.ScopeEnum.Request, { allowDowngrade: true })
], TaskInstanceService);
exports.default = TaskInstanceService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFza0luc3RhbmNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3NlcnZpY2UvdGFza0luc3RhbmNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsaUNBQWlDO0FBQ2pDLHlDQUFtRTtBQUNuRSwrQ0FBc0Q7QUFDdEQscUNBQWtEO0FBQ2xELDZCQUE2QjtBQUM3QiwwQ0FBMEM7QUFDMUMsaUNBQTBCO0FBQzFCLG1EQUErQztBQUUvQyxvREFBZ0Q7QUFFaEQsd0RBQW9EO0FBQ3BELGtEQUFnRDtBQUNoRCxpQ0FBaUM7QUFFakM7O0dBRUc7QUFHWSxJQUFNLG1CQUFtQixHQUF6QixNQUFNLG1CQUFvQixTQUFRLHNCQUEwQjtJQUc3RCxLQUFLLENBQThCO0lBRzdDLFdBQVcsQ0FBZTtJQUUxQixhQUFhO0lBQ2IsS0FBSyxDQUFDLGtCQUFrQixDQUFDLElBQW1CLEVBQUUsU0FBdUIsRUFBRSxTQUFpQixFQUFFO1FBQ3RGLE1BQU0sUUFBUSxHQUFHLElBQUksc0JBQWUsRUFBRSxDQUFDO1FBQ3ZDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUUxQixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLGNBQWMsRUFBRSxPQUFPLElBQUksTUFBTSxDQUFDO1FBQ3pELFFBQVEsQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDLE9BQU8sR0FBRyxNQUFNLElBQUksSUFBSSxDQUFDLENBQUMsaUNBQWlDO1FBRXZGLE9BQU87UUFDUCw2Q0FBNkM7UUFFN0MsUUFBUSxDQUFDLFVBQVUsR0FBRyxRQUFRLENBQUMsVUFBVSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7UUFFdkQsSUFBRyxDQUFDLFNBQVM7WUFBRSxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsV0FBVyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxpQkFB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