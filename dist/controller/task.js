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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskController = void 0;
const core_1 = require("@midwayjs/core");
const base_controller_1 = require("../base/base.controller");
const task_1 = require("../service/task");
const taskInstance_1 = require("../service/taskInstance");
const taskConst_1 = require("../model/taskConst");
const taskConfig_1 = require("../model/taskConfig");
const decorators = require("../lib/decorator");
const enumType_1 = require("@fefeding/common/dist/models/base/enumType");
let TaskController = class TaskController extends base_controller_1.BaseController {
    taskService;
    taskInstanceService;
    /**
     * 查询任务配置
     * @param ctx
     */
    async query(params) {
        const res = await this.taskService.query(params);
        return res;
    }
    async save(data) {
        if (!this.taskService.checkManager()) {
            throw Error('没有权限');
        }
        const fields = {};
        if (data.name) {
            fields['name'] = data.name;
        }
        if (data.description) {
            fields['description'] = data.description;
        }
        if (typeof data.timeSize !== 'undefined') {
            fields['timeSize'] = data.timeSize;
        }
        if (data.timeValue) {
            fields['timeValue'] = data.timeValue;
        }
        if (data.timeout) {
            fields['timeout'] = data.timeout;
        }
        if (data.script) {
            fields['script'] = data.script;
        }
        if (data.watcher) {
            fields['watcher'] = data.watcher;
        }
        if (data.id > 0) {
            const task = await this.taskService.getById(data.id);
            if (!task)
                throw Error('任务不存在');
            task.fromJSON(data); // 写入改变
            const res = await this.taskService.save(task);
            return res;
        }
        else {
            fields['description'] = fields['description'] || '';
            fields['creator'] = fields['updater'];
            const task = new taskConfig_1.default();
            task.fromJSON(fields);
            const res = await this.taskService.insert(task);
            return res;
        }
    }
    async setState(data) {
        if (!this.taskService.checkManager()) {
            throw Error('没有权限');
        }
        if (data.id > 0) {
            const task = await this.taskService.getById(data.id);
            if (!task) {
                throw Error('指定的任务不存在');
            }
            switch (data.state) {
                case taskConst_1.TaskState.init: {
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
    async run(data) {
        if (!this.taskService.checkManager()) {
            throw Error('没有权限');
        }
        if (!data.id) {
            throw new Error('请指定任务');
        }
        try {
            const task = await this.taskService.getById(data.id);
            //console.log(task);
            if (task && task.state === taskConst_1.TaskState.start && task.valid == enumType_1.EValid.Valid) {
                const res = await this.taskInstanceService.createTaskInstance(task);
                return res;
            }
            else {
                throw new Error('任务不存在或未启用');
            }
        }
        catch (e) {
            throw e;
        }
    }
};
__decorate([
    (0, core_1.Inject)(),
    __metadata("design:type", task_1.default)
], TaskController.prototype, "taskService", void 0);
__decorate([
    (0, core_1.Inject)(),
    __metadata("design:type", taskInstance_1.default)
], TaskController.prototype, "taskInstanceService", void 0);
__decorate([
    decorators.checkApiToken(false),
    decorators.checkLogin(true),
    (0, core_1.All)('/query'),
    __param(0, (0, core_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "query", null);
__decorate([
    decorators.checkApiToken(false),
    decorators.checkLogin(true),
    (0, core_1.All)('/save'),
    __param(0, (0, core_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "save", null);
__decorate([
    (0, core_1.All)('/setState'),
    decorators.checkApiToken(false),
    decorators.checkLogin(true),
    __param(0, (0, core_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "setState", null);
__decorate([
    (0, core_1.All)('/run'),
    decorators.checkApiToken(false),
    decorators.checkLogin(true),
    __param(0, (0, core_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "run", null);
TaskController = __decorate([
    (0, core_1.Provide)(),
    (0, core_1.Controller)('/api/task')
], TaskController);
exports.TaskController = TaskController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFzay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb250cm9sbGVyL3Rhc2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEseUNBQXdFO0FBQ3hFLDZEQUF5RDtBQUN6RCwwQ0FBMEM7QUFDMUMsMERBQTBEO0FBQzFELGtEQUErQztBQUMvQyxvREFBZ0Q7QUFDaEQsK0NBQStDO0FBQy9DLHlFQUFvRTtBQUk3RCxJQUFNLGNBQWMsR0FBcEIsTUFBTSxjQUFlLFNBQVEsZ0NBQWM7SUFFOUMsV0FBVyxDQUFjO0lBRXpCLG1CQUFtQixDQUFzQjtJQUV6Qzs7O09BR0c7SUFJVSxBQUFOLEtBQUssQ0FBQyxLQUFLLENBQVMsTUFBVztRQUVsQyxNQUFNLEdBQUcsR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2pELE9BQU8sR0FBRyxDQUFDO0lBQ2YsQ0FBQztJQUtZLEFBQU4sS0FBSyxDQUFDLElBQUksQ0FBUyxJQUFTO1FBQy9CLElBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksRUFBRSxFQUFFO1lBQ2pDLE1BQU0sS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQ3ZCO1FBQ0QsTUFBTSxNQUFNLEdBQUcsRUFBUyxDQUFDO1FBQ3pCLElBQUcsSUFBSSxDQUFDLElBQUksRUFBRTtZQUNWLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1NBQzlCO1FBQ0QsSUFBRyxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ2pCLE1BQU0sQ0FBQyxhQUFhLENBQUMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1NBQzVDO1FBQ0QsSUFBRyxPQUFPLElBQUksQ0FBQyxRQUFRLEtBQUssV0FBVyxFQUFFO1lBQ3JDLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1NBQ3RDO1FBQ0QsSUFB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