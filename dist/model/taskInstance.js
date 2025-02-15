'use strict';
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
exports.TaskInstance = void 0;
const typeorm_1 = require("typeorm");
const baseORM_1 = require("@fefeding/common/dist/models/base/baseORM");
const taskConst_1 = require("./taskConst");
let TaskInstance = class TaskInstance extends baseORM_1.default {
    id;
    taskId = 0;
    execServer = '';
    execStartTime = '';
    execEndTime = '';
    status = taskConst_1.TaskStatus.init;
    log = '';
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({
        name: 'Fid',
        comment: '数据唯一健'
    }),
    __metadata("design:type", Number)
], TaskInstance.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'Ftask_id',
        type: 'int',
        comment: '关联的任务ID'
    }),
    __metadata("design:type", Number)
], TaskInstance.prototype, "taskId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'Fexec_server',
        type: 'varchar',
        length: 64,
        comment: '运行服务器',
        nullable: true
    }),
    __metadata("design:type", String)
], TaskInstance.prototype, "execServer", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'Fexec_start_time',
        type: 'varchar',
        length: 32,
        comment: '运行起始时间',
        nullable: true
    }),
    __metadata("design:type", String)
], TaskInstance.prototype, "execStartTime", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'Fexec_end_time',
        type: 'varchar',
        length: 32,
        comment: '运行结束时间',
        nullable: true
    }),
    __metadata("design:type", String)
], TaskInstance.prototype, "execEndTime", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'Fstatus',
        type: 'smallint',
        default: taskConst_1.TaskStatus.init,
        comment: '任务状态'
    }),
    __metadata("design:type", Number)
], TaskInstance.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'Flog',
        type: 'longtext',
        comment: '运行日志',
        nullable: true
    }),
    __metadata("design:type", String)
], TaskInstance.prototype, "log", void 0);
TaskInstance = __decorate([
    (0, typeorm_1.Entity)('t_task_instance')
], TaskInstance);
exports.TaskInstance = TaskInstance;
exports.default = TaskInstance;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFza0luc3RhbmNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL21vZGVsL3Rhc2tJbnN0YW5jZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7Ozs7Ozs7Ozs7OztBQUViLHFDQUFpRTtBQUNqRSx1RUFBbUU7QUFDbkUsMkNBQXVDO0FBSXhCLElBQU0sWUFBWSxHQUFsQixNQUFNLFlBQWEsU0FBUSxpQkFBVTtJQUt6QyxFQUFFLENBQVM7SUFPWCxNQUFNLEdBQVcsQ0FBQyxDQUFDO0lBU25CLFVBQVUsR0FBVyxFQUFFLENBQUM7SUFTeEIsYUFBYSxHQUFXLEVBQUUsQ0FBQztJQVMzQixXQUFXLEdBQVcsRUFBRSxDQUFDO0lBUXpCLE1BQU0sR0FBZSxzQkFBVSxDQUFDLElBQUksQ0FBQztJQVFyQyxHQUFHLEdBQVcsRUFBRSxDQUFDO0NBQzNCLENBQUE7QUF2REc7SUFBQyxJQUFBLGdDQUFzQixFQUFDO1FBQ3BCLElBQUksRUFBRSxLQUFLO1FBQ1gsT0FBTyxFQUFFLE9BQU87S0FDbkIsQ0FBQzs7d0NBQ2dCO0FBRWxCO0lBQUMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osSUFBSSxFQUFFLFVBQVU7UUFDaEIsSUFBSSxFQUFFLEtBQUs7UUFDWCxPQUFPLEVBQUUsU0FBUztLQUNyQixDQUFDOzs0Q0FDd0I7QUFFMUI7SUFBQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixJQUFJLEVBQUUsY0FBYztRQUNwQixJQUFJLEVBQUUsU0FBUztRQUNmLE1BQU0sRUFBRSxFQUFFO1FBQ1YsT0FBTyxFQUFFLE9BQU87UUFDaEIsUUFBUSxFQUFFLElBQUk7S0FDakIsQ0FBQzs7Z0RBQzZCO0FBRS9CO0lBQUMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osSUFBSSxFQUFFLGtCQUFrQjtRQUN4QixJQUFJLEVBQUUsU0FBUztRQUNmLE1BQU0sRUFBRSxFQUFFO1FBQ1YsT0FBTyxFQUFFLFFBQVE7UUFDakIsUUFBUSxFQUFFLElBQUk7S0FDakIsQ0FBQzs7bURBQ2dDO0FBRWxDO0lBQUMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osSUFBSSxFQUFFLGdCQUFnQjtRQUN0QixJQUFJLEVBQUUsU0FBUztRQUNmLE1BQU0sRUFBRSxFQUFFO1FBQ1YsT0FBTyxFQUFFLFFBQVE7UUFDakIsUUFBUSxFQUFFLElBQUk7S0FDakIsQ0FBQzs7aURBQzhCO0FBRWhDO0lBQUMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osSUFBSSxFQUFFLFNBQVM7UUFDZixJQUFJLEVBQUUsVUFBVTtRQUNoQixPQUFPLEVBQUUsc0JBQVUsQ0FBQyxJQUFJO1FBQ3hCLE9BQU8sRUFBRSxNQUFNO0tBQ2xCLENBQUM7OzRDQUMwQztBQUU1QztJQUFDLElBQUEsZ0JBQU0sRUFBQztRQUNKLElBQUksRUFBRSxNQUFNO1FBQ1osSUFBSSxFQUFFLFVBQVU7UUFDaEIsT0FBTyxFQUFFLE1BQU07UUFDZixRQUFRLEVBQUUsSUFBSTtLQUNqQixDQUFDOzt5Q0FDc0I7QUF2RFAsWUFBWTtJQURoQyxJQUFBLGdCQUFNLEVBQUMsaUJBQWlCLENBQUM7R0FDTCxZQUFZLENBd0RoQztBQUlRLG9DQUFZO2tCQTVEQSxZQUFZIn0=