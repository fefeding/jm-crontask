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
exports.TaskConfig = void 0;
const typeorm_1 = require("typeorm");
const baseORM_1 = require("@fefeding/common/dist/models/base/baseORM");
const taskConst_1 = require("./taskConst");
let TaskConfig = class TaskConfig extends baseORM_1.default {
    id;
    name = '';
    description = '';
    script = '';
    timeSize = taskConst_1.TaskTimeSize.single;
    timeout = 1800;
    state = taskConst_1.TaskState.init;
    /**
     * 当为单次执行时，就是一个具体的时间，
     * 当为每天时，这里可以指定具体几点几分几秒执行
     * 当为每秒、分、时。这个值不采用，循环执行
     */
    timeValue = '';
    lastRunTime = '';
    /**
     * 关注人员工ID  id|id|,
     */
    watcher = '';
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({
        name: 'Fid',
        comment: '数据唯一健'
    }),
    __metadata("design:type", Number)
], TaskConfig.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'Fname',
        type: 'varchar',
        length: 64,
        comment: '任务名称'
    }),
    __metadata("design:type", String)
], TaskConfig.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'Fdescription',
        type: 'varchar',
        default: '',
        length: 128,
        comment: '说明文案'
    }),
    __metadata("design:type", String)
], TaskConfig.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'Fscript',
        type: 'text',
        comment: '运行脚本'
    }),
    __metadata("design:type", String)
], TaskConfig.prototype, "script", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'Ftime_size',
        type: 'smallint',
        default: 0,
        comment: '任务执行时间单位'
    }),
    __metadata("design:type", Number)
], TaskConfig.prototype, "timeSize", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'Ftimeout',
        type: 'int',
        default: 1800,
        comment: '超时时间，单位秒'
    }),
    __metadata("design:type", Object)
], TaskConfig.prototype, "timeout", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'Fstate',
        type: 'smallint',
        default: taskConst_1.TaskState.init,
        comment: '任务执行时间单位'
    }),
    __metadata("design:type", Number)
], TaskConfig.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'Ftime_value',
        type: 'varchar',
        default: '',
        comment: '执行的具体时间，格式（YYYY-MM-DD hh:mm:ss）'
    }),
    __metadata("design:type", String)
], TaskConfig.prototype, "timeValue", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'Flast_run_time',
        type: 'varchar',
        default: '',
        comment: '最后一次执行时间，格式（YYYY-MM-DD hh:mm:ss）'
    }),
    __metadata("design:type", String)
], TaskConfig.prototype, "lastRunTime", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'Fwatcher',
        type: 'varchar',
        length: 64,
        default: '',
        comment: '任务关注人，staffid|staffid|...'
    }),
    __metadata("design:type", String)
], TaskConfig.prototype, "watcher", void 0);
TaskConfig = __decorate([
    (0, typeorm_1.Entity)('t_task_config')
], TaskConfig);
exports.TaskConfig = TaskConfig;
exports.default = TaskConfig;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFza0NvbmZpZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbC90YXNrQ29uZmlnLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7Ozs7Ozs7Ozs7O0FBQ2IscUNBQWlFO0FBQ2pFLHVFQUFtRTtBQUVuRSwyQ0FBb0Q7QUFLckMsSUFBTSxVQUFVLEdBQWhCLE1BQU0sVUFBVyxTQUFRLGlCQUFVO0lBS3ZDLEVBQUUsQ0FBUztJQVFYLElBQUksR0FBVyxFQUFFLENBQUM7SUFTbEIsV0FBVyxHQUFXLEVBQUUsQ0FBQztJQU96QixNQUFNLEdBQVcsRUFBRSxDQUFDO0lBUXBCLFFBQVEsR0FBaUIsd0JBQVksQ0FBQyxNQUFNLENBQUM7SUFRN0MsT0FBTyxHQUFHLElBQUksQ0FBQztJQVFmLEtBQUssR0FBYyxxQkFBUyxDQUFDLElBQUksQ0FBQztJQUV6Qzs7OztPQUlHO0lBT0ksU0FBUyxHQUFXLEVBQUUsQ0FBQztJQVF2QixXQUFXLEdBQVcsRUFBRSxDQUFDO0lBRWhDOztPQUVHO0lBUUksT0FBTyxHQUFXLEVBQUUsQ0FBQztDQUMvQixDQUFBO0FBdEZHO0lBQUMsSUFBQSxnQ0FBc0IsRUFBQztRQUNwQixJQUFJLEVBQUUsS0FBSztRQUNYLE9BQU8sRUFBRSxPQUFPO0tBQ25CLENBQUM7O3NDQUNnQjtBQUVsQjtJQUFDLElBQUEsZ0JBQU0sRUFBQztRQUNKLElBQUksRUFBRSxPQUFPO1FBQ2IsSUFBSSxFQUFFLFNBQVM7UUFDZixNQUFNLEVBQUUsRUFBRTtRQUNWLE9BQU8sRUFBRSxNQUFNO0tBQ2xCLENBQUM7O3dDQUN1QjtBQUV6QjtJQUFDLElBQUEsZ0JBQU0sRUFBQztRQUNKLElBQUksRUFBRSxjQUFjO1FBQ3BCLElBQUksRUFBRSxTQUFTO1FBQ2YsT0FBTyxFQUFFLEVBQUU7UUFDWCxNQUFNLEVBQUUsR0FBRztRQUNYLE9BQU8sRUFBRSxNQUFNO0tBQ2xCLENBQUM7OytDQUM4QjtBQUVoQztJQUFDLElBQUEsZ0JBQU0sRUFBQztRQUNKLElBQUksRUFBRSxTQUFTO1FBQ2YsSUFBSSxFQUFFLE1BQU07UUFDWixPQUFPLEVBQUUsTUFBTTtLQUNsQixDQUFDOzswQ0FDeUI7QUFFM0I7SUFBQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixJQUFJLEVBQUUsWUFBWTtRQUNsQixJQUFJLEVBQUUsVUFBVTtRQUNoQixPQUFPLEVBQUUsQ0FBQztRQUNWLE9BQU8sRUFBRSxVQUFVO0tBQ3RCLENBQUM7OzRDQUNrRDtBQUVwRDtJQUFDLElBQUEsZ0JBQU0sRUFBQztRQUNKLElBQUksRUFBRSxVQUFVO1FBQ2hCLElBQUksRUFBRSxLQUFLO1FBQ1gsT0FBTyxFQUFFLElBQUk7UUFDYixPQUFPLEVBQUUsVUFBVTtLQUN0QixDQUFDOzsyQ0FDb0I7QUFFdEI7SUFBQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixJQUFJLEVBQUUsUUFBUTtRQUNkLElBQUksRUFBRSxVQUFVO1FBQ2hCLE9BQU8sRUFBRSxxQkFBUyxDQUFDLElBQUk7UUFDdkIsT0FBTyxFQUFFLFVBQVU7S0FDdEIsQ0FBQzs7eUNBQ3VDO0FBT3pDO0lBQUMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osSUFBSSxFQUFFLGFBQWE7UUFDbkIsSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsRUFBRTtRQUNYLE9BQU8sRUFBRSxpQ0FBaUM7S0FDN0MsQ0FBQzs7NkNBQzRCO0FBRTlCO0lBQUMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osSUFBSSxFQUFFLGdCQUFnQjtRQUN0QixJQUFJLEVBQUUsU0FBUztRQUNmLE9BQU8sRUFBRSxFQUFFO1FBQ1gsT0FBTyxFQUFFLGtDQUFrQztLQUM5QyxDQUFDOzsrQ0FDOEI7QUFLaEM7SUFBQyxJQUFBLGdCQUFNLEVBQUM7UUFDSixJQUFJLEVBQUUsVUFBVTtRQUNoQixJQUFJLEVBQUUsU0FBUztRQUNmLE1BQU0sRUFBRSxFQUFFO1FBQ1YsT0FBTyxFQUFFLEVBQUU7UUFDWCxPQUFPLEVBQUUsMkJBQTJCO0tBQ3ZDLENBQUM7OzJDQUMwQjtBQXRGWCxVQUFVO0lBRDlCLElBQUEsZ0JBQU0sRUFBQyxlQUFlLENBQUM7R0FDSCxVQUFVLENBdUY5QjtBQUlRLGdDQUFVO2tCQTNGRSxVQUFVIn0=