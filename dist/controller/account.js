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
exports.AccountController = void 0;
const core_1 = require("@midwayjs/core");
const base_controller_1 = require("../base/base.controller");
const account_1 = require("../service/account");
const decorator_1 = require("../lib/decorator");
const pagination_1 = require("@fefeding/common/dist/models/base/pagination");
const account_2 = require("@fefeding/common/dist/models/account/account");
const user_1 = require("@fefeding/common/dist/models/account/user");
let AccountController = class AccountController extends base_controller_1.BaseController {
    accountService;
    async queryUser(queryInfo) {
        if (!this.accountService.checkManager()) {
            throw Error('没有查询权限');
        }
        if (queryInfo.size > 100)
            queryInfo.size = 100;
        const res = await this.accountService.queryUser(queryInfo);
        return res;
    }
    async queryUserName(queryInfo) {
        const res = await this.accountService.queryUser(queryInfo);
        const names = [];
        if (res.data) {
            for (const u of res.data) {
                names.push({
                    name: u.user?.name || '',
                    account: u.account || '',
                    loginId: u.loginId,
                    userId: u.userId,
                });
            }
        }
        return names;
    }
    async getByLoginId(id) {
        const res = await this.accountService.getByLoginId(id);
        if (res?.data) {
            return {
                loginId: id,
                userId: res.data.userId,
                account: res.data.account,
            };
        }
        return res;
    }
    /**
     * 创建帐号
     */
    async createAccount(acc) {
        if (!this.accountService.checkManager()) {
            throw Error('没有权限');
        }
        const res = await this.accountService.createAccount(acc);
        return res;
    }
    /**
     * 修改密码
     */
    async updatePassword(account, oldPassword, newPassword) {
        const res = await this.accountService.updatePassword(account, oldPassword, newPassword);
        return res;
    }
    /**
     * 修改用户信息
     */
    async updateUser(user) {
        if (!this.accountService.checkManager()) {
            throw Error('没有权限');
        }
        const res = await this.accountService.updateUser(user);
        return res;
    }
};
__decorate([
    (0, core_1.Inject)(),
    __metadata("design:type", account_1.AccountService)
], AccountController.prototype, "accountService", void 0);
__decorate([
    (0, core_1.All)('/queryUser'),
    (0, decorator_1.checkLogin)(true) // 需要登陆态的接口
    ,
    __param(0, (0, core_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_1.PageRequest]),
    __metadata("design:returntype", Promise)
], AccountController.prototype, "queryUser", null);
__decorate([
    (0, core_1.All)('/queryUserName'),
    (0, decorator_1.checkLogin)(true) // 需要登陆态的接口
    ,
    __param(0, (0, core_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_1.PageRequest]),
    __metadata("design:returntype", Promise)
], AccountController.prototype, "queryUserName", null);
__decorate([
    (0, core_1.All)('/getByLoginId'),
    (0, decorator_1.checkLogin)(true) // 需要登陆态的接口
    ,
    __param(0, (0, core_1.Query)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AccountController.prototype, "getByLoginId", null);
__decorate([
    (0, core_1.All)('/createAccount'),
    (0, decorator_1.checkLogin)(true) // 需要登陆态的接口
    ,
    __param(0, (0, core_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [account_2.default]),
    __metadata("design:returntype", Promise)
], AccountController.prototype, "createAccount", null);
__decorate([
    (0, core_1.All)('/updatePassword'),
    (0, decorator_1.checkLogin)(true) // 需要登陆态的接口
    ,
    __param(0, (0, core_1.Body)('account')),
    __param(1, (0, core_1.Body)('oldPassword')),
    __param(2, (0, core_1.Body)('newPassword')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AccountController.prototype, "updatePassword", null);
__decorate([
    (0, core_1.All)('/updateUser'),
    (0, decorator_1.checkLogin)(true) // 需要登陆态的接口
    ,
    __param(0, (0, core_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_1.default]),
    __metadata("design:returntype", Promise)
], AccountController.prototype, "updateUser", null);
AccountController = __decorate([
    (0, core_1.Provide)(),
    (0, core_1.Controller)('/api/account')
], AccountController);
exports.AccountController = AccountController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjb3VudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb250cm9sbGVyL2FjY291bnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEseUNBQStFO0FBQy9FLDZEQUF5RDtBQUN6RCxnREFBb0Q7QUFDcEQsZ0RBQThDO0FBQzlDLDZFQUEyRTtBQUMzRSwwRUFBbUU7QUFDbkUsb0VBQTZEO0FBSXRELElBQU0saUJBQWlCLEdBQXZCLE1BQU0saUJBQWtCLFNBQVEsZ0NBQWM7SUFFakQsY0FBYyxDQUFpQjtJQUl6QixBQUFOLEtBQUssQ0FBQyxTQUFTLENBQVMsU0FBc0I7UUFDMUMsSUFBRyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsWUFBWSxFQUFFLEVBQUU7WUFDcEMsTUFBTSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDekI7UUFDRCxJQUFHLFNBQVMsQ0FBQyxJQUFJLEdBQUcsR0FBRztZQUFFLFNBQVMsQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDO1FBQzlDLE1BQU0sR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDM0QsT0FBTyxHQUFHLENBQUM7SUFDZixDQUFDO0lBSUssQUFBTixLQUFLLENBQUMsYUFBYSxDQUFTLFNBQXNCO1FBQzlDLE1BQU0sR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDM0QsTUFBTSxLQUFLLEdBQUcsRUFBRSxDQUFDO1FBQ2pCLElBQUcsR0FBRyxDQUFDLElBQUksRUFBRTtZQUNULEtBQUksTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDLElBQUksRUFBRTtnQkFDckIsS0FBSyxDQUFDLElBQUksQ0FBQztvQkFDUCxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxJQUFJLElBQUksRUFBRTtvQkFDeEIsT0FBTyxFQUFFLENB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