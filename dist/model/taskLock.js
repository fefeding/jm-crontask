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
exports.TaskLock = void 0;
const typeorm_1 = require("typeorm");
const baseORM_1 = require("@fefeding/common/dist/models/base/baseORM");
let TaskLock = class TaskLock extends baseORM_1.default {
    key;
    name = '';
};
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        name: 'Fkey',
        type: 'varchar',
        length: 32,
        comment: '唯一锁'
    }),
    __metadata("design:type", String)
], TaskLock.prototype, "key", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'Fname',
        type: 'varchar',
        length: 64,
        comment: '锁名称'
    }),
    __metadata("design:type", String)
], TaskLock.prototype, "name", void 0);
TaskLock = __decorate([
    (0, typeorm_1.Entity)('t_task_lock')
], TaskLock);
exports.TaskLock = TaskLock;
exports.default = TaskLock;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFza0xvY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbW9kZWwvdGFza0xvY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7Ozs7Ozs7Ozs7QUFDYixxQ0FBd0Q7QUFDeEQsdUVBQW1FO0FBSXBELElBQU0sUUFBUSxHQUFkLE1BQU0sUUFBUyxTQUFRLGlCQUFVO0lBT3JDLEdBQUcsQ0FBUztJQVFaLElBQUksR0FBVyxFQUFFLENBQUM7Q0FDNUIsQ0FBQTtBQWZHO0lBQUMsSUFBQSx1QkFBYSxFQUFDO1FBQ1gsSUFBSSxFQUFFLE1BQU07UUFDWixJQUFJLEVBQUUsU0FBUztRQUNmLE1BQU0sRUFBRSxFQUFFO1FBQ1YsT0FBTyxFQUFFLEtBQUs7S0FDakIsQ0FBQzs7cUNBQ2lCO0FBRW5CO0lBQUMsSUFBQSxnQkFBTSxFQUFDO1FBQ0osSUFBSSxFQUFFLE9BQU87UUFDYixJQUFJLEVBQUUsU0FBUztRQUNmLE1BQU0sRUFBRSxFQUFFO1FBQ1YsT0FBTyxFQUFFLEtBQUs7S0FDakIsQ0FBQzs7c0NBQ3VCO0FBZlIsUUFBUTtJQUQ1QixJQUFBLGdCQUFNLEVBQUMsYUFBYSxDQUFDO0dBQ0QsUUFBUSxDQWdCNUI7QUFJUSw0QkFBUTtrQkFwQkksUUFBUSJ9