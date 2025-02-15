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
exports.TaskInstanceController = void 0;
const core_1 = require("@midwayjs/core");
const base_controller_1 = require("../base/base.controller");
const task_1 = require("../service/task");
const taskInstance_1 = require("../service/taskInstance");
const decorators = require("../lib/decorator");
let TaskInstanceController = class TaskInstanceController extends base_controller_1.BaseController {
    taskService;
    taskInstanceService;
    /**
     * 查询任务实例
     * @param ctx
     */
    async query(params) {
        const res = await this.taskInstanceService.query(params);
        return res;
    }
    /**
     * 查询任务运行记录
     * @param ctx
     */
    async get(params) {
        const data = await this.taskInstanceService.getById(params.id);
        return data;
    }
    /**
     * 更改实例状态
     * @param ctx
     */
    async updateStatus(params) {
        if (!this.taskInstanceService.checkManager()) {
            throw Error('没有权限');
        }
        return await this.taskInstanceService.updateStatus(params.id, params.status);
    }
};
__decorate([
    (0, core_1.Inject)(),
    __metadata("design:type", task_1.default)
], TaskInstanceController.prototype, "taskService", void 0);
__decorate([
    (0, core_1.Inject)(),
    __metadata("design:type", taskInstance_1.default)
], TaskInstanceController.prototype, "taskInstanceService", void 0);
__decorate([
    decorators.checkApiToken(false),
    decorators.checkLogin(true),
    (0, core_1.All)('/query'),
    __param(0, (0, core_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TaskInstanceController.prototype, "query", null);
__decorate([
    decorators.checkApiToken(false),
    decorators.checkLogin(true),
    (0, core_1.All)('/get'),
    __param(0, (0, core_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TaskInstanceController.prototype, "get", null);
__decorate([
    decorators.checkApiToken(false),
    decorators.checkLogin(true),
    (0, core_1.All)('/updateStatus'),
    __param(0, (0, core_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TaskInstanceController.prototype, "updateStatus", null);
TaskInstanceController = __decorate([
    (0, core_1.Provide)(),
    (0, core_1.Controller)('/api/instance')
], TaskInstanceController);
exports.TaskInstanceController = TaskInstanceController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zdGFuY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29udHJvbGxlci9pbnN0YW5jZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSx5Q0FBd0U7QUFDeEUsNkRBQXlEO0FBQ3pELDBDQUEwQztBQUMxQywwREFBMEQ7QUFFMUQsK0NBQStDO0FBSXhDLElBQU0sc0JBQXNCLEdBQTVCLE1BQU0sc0JBQXVCLFNBQVEsZ0NBQWM7SUFFdEQsV0FBVyxDQUFjO0lBRXpCLG1CQUFtQixDQUFzQjtJQUV6Qzs7O09BR0c7SUFJVSxBQUFOLEtBQUssQ0FBQyxLQUFLLENBQVMsTUFBVztRQUVsQyxNQUFNLEdBQUcsR0FBRyxNQUFNLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDekQsT0FBTyxHQUFHLENBQUM7SUFDZixDQUFDO0lBRUQ7OztPQUdHO0lBSVUsQUFBTixLQUFLLENBQUMsR0FBRyxDQUFTLE1BRXhCO1FBQ0csTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUUvRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQ7OztPQUdHO0lBSVUsQUFBTixLQUFLLENBQUMsWUFBWSxDQUFTLE1BR2pDO1FBQ0csSUFBRyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxZQUFZLEVBQUUsRUFBRTtZQUN6QyxNQUFNLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUN2QjtRQUNELE9BQU8sTUFBTSxJQUFJLENBQUMsbUJBQW1CLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2pGLENBQUM7Q0FDSixDQUFBO0FBakRHO0lBQUMsSUFBQSxhQUFNLEdBQUU7OEJBQ0ksY0FBVzsyREFBQztBQUN6QjtJQUFDLElBQUEsYUFBTSxHQUFFOzhCQUNZLHNCQUFtQjttRUFBQztBQVM1QjtJQUhaLFVBQVUsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDO0lBQy9CLFVBQVUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDO0lBQzNCLElBQUEsVUFBRyxFQUFDLFFBQVEsQ0FBQztJQUNNLFdBQUEsSUFBQSxXQUFJLEdBQUUsQ0FBQTs7OzttREFJekI7QUFTWTtJQUhaLFVBQVUsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDO0lBQy9CLFVBQVUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDO0lBQzNCLElBQUEsVUFBRyxFQUFDLE1BQU0sQ0FBQztJQUNNLFdBQUEsSUFBQSxXQUFJLEdBQUUsQ0FBQTs7OztpREFNdkI7QUFTWTtJQUhaLFVBQVUsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDO0lBQy9CLFVBQVUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDO0lBQzNCLElBQUEsVUFBRyxFQUFDLGVBQWUsQ0FBQztJQUNNLFdBQUEsSUFBQSxXQUFJLEdBQUUsQ0FBQTs7OzswREFRaEM7QUFqRFEsc0JBQXNCO0lBRmxDLElBQUEsY0FBTyxHQUFFO0lBQ1QsSUFBQSxpQkFBVSxFQUFDLGVBQWUsQ0FBQztHQUNmLHNCQUFzQixDQWtEbEM7QUFsRFksd0RBQXNCIn0=