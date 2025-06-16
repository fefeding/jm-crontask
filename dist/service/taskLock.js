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
const typeorm_2 = require("typeorm");
const base_model_1 = require("../base/base.model");
const taskLock_1 = require("../model/taskLock");
/**
 * 任务锁
 */
let TaskLockService = class TaskLockService extends base_model_1.BaseModel {
    model;
    /** 在指定锁中执行事务 */
    async runLock(lockKey, fun, qryRunner) {
        //console.log('lock', lockKey);
        qryRunner = qryRunner || this.model.createQueryBuilder().connection.createQueryRunner(); // ReplicationMode = "master" | "slave";
        try {
            //console.log(lockKey, ' 等待锁');
            // 开启事务
            await qryRunner.startTransaction();
            const queryBuilder = this.model.createQueryBuilder('taskLock', qryRunner);
            // 锁定和等待锁
            const qry = await queryBuilder.where('taskLock.key=:key', {
                key: lockKey
            })
                .useTransaction(true)
                .setLock('pessimistic_write');
            let lock = await qry.getOne();
            if (!lock) {
                const newLock = new taskLock_1.default();
                newLock.key = lockKey;
                newLock.name = '';
                newLock.updater = newLock.creator = 'task';
                const ret = await queryBuilder.insert().into(taskLock_1.default).values(newLock).execute();
                console.log('增加锁数据', lockKey, ret);
                lock = await qry.getOne();
            }
            //console.log(lockKey, '锁定');
            const result = await fun(qryRunner); // 当前事务中执行业务逻辑
            //console.log(lockKey, '释放锁定');
            await qryRunner.commitTransaction(); // 提交事务
            return result;
        }
        catch (e) {
            console.log(e);
            this.ctx.logger?.error('runLock error:', e);
            await qryRunner.rollbackTransaction();
        }
        finally {
            await qryRunner.release();
        }
    }
};
__decorate([
    (0, typeorm_1.InjectEntityModel)(taskLock_1.default),
    __metadata("design:type", typeorm_2.Repository)
], TaskLockService.prototype, "model", void 0);
TaskLockService = __decorate([
    (0, core_1.Provide)(),
    (0, core_1.Scope)(core_1.ScopeEnum.Singleton)
], TaskLockService);
exports.default = TaskLockService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFza0xvY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmljZS90YXNrTG9jay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLHlDQUEyRDtBQUMzRCwrQ0FBc0Q7QUFDdEQscUNBQWtEO0FBQ2xELG1EQUErQztBQUMvQyxnREFBNEM7QUFHNUM7O0dBRUc7QUFHWSxJQUFNLGVBQWUsR0FBckIsTUFBTSxlQUFnQixTQUFRLHNCQUFzQjtJQUdyRCxLQUFLLENBQTBCO0lBR3pDLGdCQUFnQjtJQUNoQixLQUFLLENBQUMsT0FBTyxDQUFDLE9BQXFCLEVBQUUsR0FBYSxFQUFFLFNBQXVCO1FBQ3ZFLCtCQUErQjtRQUUvQixTQUFTLEdBQUcsU0FBUyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxVQUFVLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFBLHdDQUF3QztRQUVoSSxJQUFJO1lBQ0EsK0JBQStCO1lBRS9CLE9BQU87WUFDUCxNQUFNLFNBQVMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBRW5DLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsVUFBVSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBRTFFLFNBQVM7WUFDVCxNQUFNLEdBQUcsR0FBRyxNQUFNLFlBQVksQ0FBQyxLQUFLLENBQUMsbUJBQW1CLEVBQUU7Z0JBQ3RELEdBQUcsRUFBRSxPQUFPO2FBQ2YsQ0FBQztpQkFDRCxjQUFjLENBQUMsSUFBSSxDQUFDO2lCQUNwQixPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQztZQUU5QixJQUFJLElBQUksR0FBRyxNQUFNLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUM5QixJQUFHLENBQUMsSUFBSSxFQUFFO2dCQUNOLE1BQU0sT0FBTyxHQUFHLElBQUksa0JBQVcsRUFBRSxDQUFDO2dCQUNsQyxPQUFPLENBQUMsR0FBRyxHQUFHLE9BQU8sQ0FBQztnQkFDdEIsT0FBTyxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7Z0JBQ2xCLE9BQU8sQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7Z0JBRTNDLE1BQU0sR0FBRyxHQUFHLE1BQU0sWUFBWSxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxrQkFBVyxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNwRixPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBRW5DLElBQUksR0FBRyxNQUFNLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQzthQUM3QjtZQUVELDZCQUE2QjtZQUU3QixNQUFNLE1BQU0sR0FBRyxNQUFNLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFBLGNBQWM7WUFFbEQsK0JBQStCO1lBQy9CLE1BQU0sU0FBUyxDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQSxPQUFPO1lBQzNDLE9BQU8sTUFBTSxDQUFDO1NBQ2pCO1FBQ0QsT0FBTSxDQUFDLEVBQUU7WUFDTCxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2YsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLGdCQUFnQixFQUFDLENBQUMsQ0FBQyxDQUFBO1lBQzFDLE1BQU0sU0FBUyxDQUFDLG1CQUFtQixFQUFFLENBQUM7U0FDekM7Z0JBQ087WUFDSixNQUFNLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztTQUM3QjtJQUNMLENBQUM7Q0FDSixDQUFBO0FBdkRHO0lBQUMsSUFBQSwyQkFBaUIsRUFBQyxrQkFBVyxDQUFDOzhCQUNkLG9CQUFVOzhDQUFjO0FBSHhCLGVBQWU7SUFGbkMsSUFBQSxjQUFPLEdBQUU7SUFDVCxJQUFBLFlBQUssRUFBQyxnQkFBUyxDQUFDLFNBQVMsQ0FBQztHQUNOLGVBQWUsQ0F5RG5DO2tCQXpEb0IsZUFBZSJ9