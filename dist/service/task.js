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
const core_1 = require("@midwayjs/core");
const typeorm_1 = require("@midwayjs/typeorm");
const moment = require("moment");
const base_model_1 = require("../base/base.model");
const taskConfig_1 = require("../model/taskConfig");
const taskInstance_1 = require("../model/taskInstance");
const taskConst_1 = require("../model/taskConst");
const typeorm_2 = require("typeorm");
const parser = require('@hardik_sharma/cron-parser-all');
/**
 * 任务
 */
let TaskService = class TaskService extends base_model_1.BaseModel {
    model;
    // 通过ID获取
    async getById(id) {
        const task = await this.model.findOneBy({
            id
        });
        return task;
    }
    // 检索
    async query(params) {
        const strWhere = ['1=1'];
        const whereParams = {};
        if (params.name) {
            strWhere.push('and TaskConfig.name like :name');
            whereParams['name'] = `%${params.name}%`;
        }
        if (params.timeSize) {
            strWhere.push('and TaskConfig.timeSize = :timeSize');
            whereParams['timeSize'] = params.timeSize;
        }
        if (params.state > 0) {
            strWhere.push('and TaskConfig.state = :state');
            whereParams['state'] = params.state;
        }
        if (params.id > 0) {
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
        const [data, count] = await qry.getManyAndCount();
        const rsp = {
            data,
            total: count
        };
        return rsp;
    }
    /**
     * 从当前可以执行的任务中，获取一条。去执行
     */
    async getCurrentTimeNeedRunTasks(qryRunner) {
        //console.log(`查询是否有需要执行的任务`);
        const queryBuilder = this.model.createQueryBuilder('task', qryRunner);
        // 上一秒处理过的先不处理
        const taskQry = queryBuilder
            // 关联是否有实例在执行或已创建，这个tick不重复创建，直接任务执行完成。
            .leftJoin(taskInstance_1.TaskInstance, 'taskInstance', `taskInstance.taskId=task.id and taskInstance.Fvalid=1 and taskInstance.status in (${taskConst_1.TaskStatus.init},${taskConst_1.TaskStatus.running})`)
            .where("taskInstance.id is null and task.state=:state and task.Fvalid=1", { state: taskConst_1.TaskState.start });
        //const sql = taskQry.getSql();
        //console.log('get task sql', sql);
        const tasks = await taskQry.getMany();
        const result = [];
        if (tasks) {
            for (const task of tasks) {
                const ret = await this.checkTaskRunTime(task, qryRunner);
                if (ret === true)
                    result.push(task);
            }
        }
        return result;
    }
    // 处理当前任务在当前时间是否需要执行
    async checkTaskRunTime(task, qryRunner) {
        try {
            //console.log(task);
            if (!task.timeValue) {
                console.log('配置的时间不正确');
                return;
            }
            // 如果是单次执行，则判断其时间符合即可
            if (task.timeSize === taskConst_1.TaskTimeSize.single) {
                const time = moment(task.timeValue);
                // 哪果单次执行时间格式不对，则不处理
                if (!time.isValid) {
                    console.log(task.id + ', 错误的时间格式');
                    return;
                }
                // 如果已到时间，则执行它
                if (time.isBefore()) {
                    // 哪果是单次执行的，则生成实例后就不再需要这个配置了
                    task.state = taskConst_1.TaskState.disabled; // 移除
                    await qryRunner.connection.getRepository(taskConfig_1.TaskConfig).save(task);
                    return true;
                }
            }
            else {
                let nextRunTime = Date.now(); // 下次执行时间
                const now = moment(); // 当前时间
                const lastRunTime = moment(task.lastRunTime || '1900-01-01 00:00:00');
                // 根据类型，判断当前时间是否需要执行
                switch (task.timeSize) {
                    case taskConst_1.TaskTimeSize.second: {
                        nextRunTime = lastRunTime.valueOf() + Number(task.timeValue) * 1000; // 每隔多少秒执行
                        // 到可以执行时间了
                        if (nextRunTime <= Date.now()) {
                            return true;
                        }
                        break;
                    }
                    case taskConst_1.TaskTimeSize.minute: {
                        nextRunTime = lastRunTime.valueOf() + Number(task.timeValue) * 1000 * 60; // 每隔多少秒执行
                        // 到可以执行时间了
                        if (nextRunTime <= Date.now()) {
                            return true;
                        }
                        break;
                    }
                    case taskConst_1.TaskTimeSize.hour: {
                        nextRunTime = lastRunTime.valueOf() + Number(task.timeValue) * 1000 * 60 * 60; // 每隔多少秒执行
                        // 到可以执行时间了
                        if (nextRunTime <= Date.now()) {
                            return true;
                        }
                        break;
                    }
                    // 按天的话会指定每天几点执行  hh:mm:ss
                    case taskConst_1.TaskTimeSize.day: {
                        const timeValue = moment(task.timeValue, 'HH:mm:ss');
                        // 如果单次执行时间格式不对，则不处理
                        if (!timeValue.isValid) {
                            console.log(task.id + ', 错误的时间格式');
                            return;
                        }
                        // 今天没执行过，且时间到点了
                        const time = timeValue.format('HH:mm:ss');
                        const nowtime = now.format('HH:mm:ss');
                        //console.log(lastRunTime.format('YYYY-MM-DD HH:mm:ss'), time, nowtime);
                        if (!(lastRunTime.year() === now.year() && lastRunTime.month() === now.month() && lastRunTime.day() === now.day()) &&
                            time <= nowtime) {
                            return true;
                        }
                        break;
                    }
                    // 按周
                    case taskConst_1.TaskTimeSize.week: {
                        break;
                    }
                    case taskConst_1.TaskTimeSize.month: {
                        break;
                    }
                    // 按照定时规则
                    case taskConst_1.TaskTimeSize.crontab: {
                        // 先解析表达式
                        try {
                            let options = {
                                currentDate: moment(lastRunTime).format('YYYY-MM-DD HH:mm:ss'),
                                tz: 'Asia/Shanghai'
                            };
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
                            const nextTimer = interval.next().toString(); // 下次执行时间
                            const prevTimer = interval.prev().toString(); // 上次执行时间
                            // console.log('interval:',task.timeValue, nextTimer, prevTimer, lastRunTime, now);
                            // 到了本次的执行时间
                            if (moment(lastRunTime).isSameOrAfter(new Date(prevTimer))
                                && moment(new Date(nextTimer)).isSameOrBefore(now)) {
                                console.log('定时器开始任务：', task.id);
                                return true;
                            }
                        }
                        catch (error) {
                            console.log('解析定时任务表达式失败: ' + error.message);
                            return;
                        }
                        break;
                    }
                }
            }
        }
        catch (e) {
            console.log(e);
            this.ctx.log.error('checkTaskRunTime error:', e);
        }
    }
};
__decorate([
    (0, typeorm_1.InjectEntityModel)(taskConfig_1.TaskConfig),
    __metadata("design:type", typeorm_2.Repository)
], TaskService.prototype, "model", void 0);
TaskService = __decorate([
    (0, core_1.Provide)(),
    (0, core_1.Scope)(core_1.ScopeEnum.Request, { allowDowngrade: true })
], TaskService);
exports.default = TaskService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFzay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2aWNlL3Rhc2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSx5Q0FBMkQ7QUFDM0QsK0NBQXNEO0FBQ3RELGlDQUFpQztBQUNqQyxtREFBK0M7QUFDL0Msb0RBQWlEO0FBQ2pELHdEQUFxRDtBQUNyRCxrREFBeUU7QUFDekUscUNBQWtEO0FBQ2xELE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO0FBRXpEOztHQUVHO0FBR1ksSUFBTSxXQUFXLEdBQWpCLE1BQU0sV0FBWSxTQUFRLHNCQUFxQjtJQUdoRCxLQUFLLENBQXlCO0lBRXhDLFNBQVM7SUFDVCxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQVU7UUFDcEIsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQztZQUNwQyxFQUFFO1NBQ0wsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVELEtBQUs7SUFDTCxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQVc7UUFFbkIsTUFBTSxRQUFRLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN6QixNQUFNLFdBQVcsR0FBRyxFQUFTLENBQUM7UUFDOUIsSUFBRyxNQUFNLENBQUMsSUFBSSxFQUFFO1lBQ1osUUFBUSxDQUFDLElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO1lBQ2hELFdBQVcsQ0FBQyxNQUFNLENBQUMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQztTQUM1QztRQUNELElBQUcsTUFBTSxDQUFDLFFBQVEsRUFBRTtZQUNoQixRQUFRLENBQUMsSUFBSSxDQUFDLHFDQUFxQyxDQUFDLENBQUM7WUFDckQsV0FBVyxDQUFDLFVBQVUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUM7U0FDN0M7UUFDRCxJQUFHLE1BQU0sQ0FBQyxL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