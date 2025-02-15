"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountService = void 0;
const core_1 = require("@midwayjs/core");
const base_service_1 = require("../base/base.service");
let AccountService = class AccountService extends base_service_1.BaseService {
    /**
     * 查询用户信息
     */
    async queryUser(req) {
        const res = await this.requestBaseApi('/api/account/queryUser', {
            data: req
        });
        return res;
    }
    /**
     * 创建帐号
     */
    async createAccount(acc) {
        if (this.checkManager(acc.account)) {
            throw Error(`${acc.account} 是内置帐号，不可创建`);
        }
        acc.creator = this.ctx.currentSession?.loginId || '';
        if (acc.user) {
            acc.user.creator = acc.creator;
        }
        const res = await this.requestBaseApi('/api/account/createAccount', {
            data: acc
        });
        return res;
    }
    /**
     * 修改密码
     */
    async updatePassword(account, oldPassword, newPassword, appId = this.baseServiceOption?.appId) {
        const res = await this.requestBaseApi('/api/account/updatePassword', {
            data: {
                account,
                oldPassword,
                newPassword,
                appId
            }
        });
        return res;
    }
    /**
     * 修改用户信息
     */
    async updateUser(user) {
        user.updater = this.ctx.currentSession?.loginId || '';
        const res = await this.requestBaseApi('/api/account/updateUser', {
            data: {
                user
            }
        });
        return res;
    }
    // 通过loginId获取
    async getByLoginId(id) {
        const res = await this.requestBaseApi('/api/account/getByLoginId', {
            data: {
                id
            }
        });
        return res;
    }
};
AccountService = __decorate([
    (0, core_1.Provide)()
], AccountService);
exports.AccountService = AccountService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjb3VudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2aWNlL2FjY291bnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEseUNBQXlDO0FBQ3pDLHVEQUFtRDtBQVE1QyxJQUFNLGNBQWMsR0FBcEIsTUFBTSxjQUFlLFNBQVEsMEJBQVc7SUFFM0M7O09BRUc7SUFDSCxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQWdCO1FBQzVCLE1BQU0sR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBd0Isd0JBQXdCLEVBQUU7WUFDbkYsSUFBSSxFQUFFLEdBQUc7U0FDWixDQUFDLENBQUM7UUFDSCxPQUFPLEdBQUcsQ0FBQztJQUNmLENBQUM7SUFDRDs7T0FFRztJQUNILEtBQUssQ0FBQyxhQUFhLENBQUMsR0FBWTtRQUM1QixJQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQy9CLE1BQU0sS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDLE9BQU8sYUFBYSxDQUFDLENBQUM7U0FDNUM7UUFDRCxHQUFHLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLE9BQU8sSUFBSSxFQUFFLENBQUM7UUFDckQsSUFBRyxHQUFHLENBQUMsSUFBSSxFQUFFO1lBQ1QsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQztTQUNsQztRQUNELE1BQU0sR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBb0IsNEJBQTRCLEVBQUU7WUFDbkYsSUFBSSxFQUFFLEdBQUc7U0FDWixDQUFDLENBQUM7UUFDSCxPQUFPLEdBQUcsQ0FBQztJQUNmLENBQUM7SUFFRDs7T0FFRztJQUNILEtBQUssQ0FBQyxjQUFjLENBQUMsT0FBZSxFQUFFLFdBQW1CLEVBQUUsV0FBbUIsRUFBRSxRQUFnQixJQUFJLENBQUMsaUJBQWlCLEVBQUUsS0FBSztRQUN6SCxNQUFNLEdBQUcsR0FBRyxNQUFNLElBQUksQ0FBQyxjQUFjLENBQW9CLDZCQUE2QixFQUFFO1lBQ3BGLElBQUksRUFBRTtnQkFDRixPQUFPO2dCQUNQLFdBQVc7Z0JBQ1gsV0FBVztnQkFDWCxLQUFLO2FBQ1I7U0FDSixDQUFDLENBQUM7UUFDSCxPQUFPLEdBQUcsQ0FBQztJQUNmLENBQUM7SUFFRDs7T0FFRztJQUNILEtBQUssQ0FBQyxVQUFVLENBQUMsSUFBVTtRQUN2QixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLE9BQU8sSUFBSSxFQUFFLENBQUM7UUFDdEQsTUFBTSxHQUFHLEdBQUcsTUFBTSxJQUFJLENBQUMsY0FBYyxDQUFpQix5QkFBeUIsRUFBRTtZQUM3RSxJQUFJLEVBQUU7Z0JBQ0YsSUFBSTthQUNQO1NBQ0osQ0FBQyxDQUFDO1FBQ0gsT0FBTyxHQUFHLENBQUM7SUFDZixDQUFDO0lBRUQsY0FBYztJQUNkLEtBQUssQ0FBQyxZQUFZLENBQUMsRUFBVTtRQUN6QixNQUFNLEdBQUcsR0FBRyxNQUFNLElBQUksQ0FBQyxjQUFjLENBQW9CLDJCQUEyQixFQUFFO1lBQ2xGLElBQUksRUFBRTtnQkFDRixFQUFFO2FBQ0w7U0FDSixDQUFDLENBQUM7UUFDSCxPQUFPLEdBQUcsQ0FBQztJQUNmLENBQUM7Q0FDSixDQUFBO0FBakVZLGNBQWM7SUFEMUIsSUFBQSxjQUFPLEdBQUU7R0FDRyxjQUFjLENBaUUxQjtBQWpFWSx3Q0FBYyJ9