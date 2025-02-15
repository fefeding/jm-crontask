"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionService = void 0;
const core_1 = require("@midwayjs/core");
const base_service_1 = require("../base/base.service");
const session_1 = require("@fefeding/common/dist/models/account/session");
let SessionService = class SessionService extends base_service_1.BaseService {
    /**
     * 根据ID获取session
     * 并判断session是否在有效期
     * @param id token唯一
     */
    async getLoginSession(id) {
        const req = new session_1.GetLoginSessionReq();
        req.id = id;
        const res = await this.requestBaseApi(req);
        return res?.data || null;
    }
    /**
     * 下线
     * @param id 需要下线的id或者session
     */
    async logout(id) {
        const req = new session_1.LogoutReq();
        req.id = id;
        const res = await this.requestBaseApi(req);
        this.ctx.currentSession = null;
        return res;
    }
    /**
     * 登录接口
     * @param loginParams 登录参数
     * @returns
     */
    async loginByWx(loginParams) {
        const req = new session_1.LoginByWxReq();
        req.fromJSON(loginParams);
        const res = await this.requestBaseApi(req);
        return res;
    }
    /**
     * 帐号登陆
     * @param loginParams
     * @returns
     */
    async loginByAccount(loginParams) {
        loginParams.appId = '0'; //this.baseServiceOption.appId?.toString() || '0';
        const req = new session_1.LoginByAccountReq();
        req.fromJSON(loginParams);
        const res = await this.requestBaseApi(req);
        return res;
    }
};
SessionService = __decorate([
    (0, core_1.Provide)(),
    (0, core_1.Scope)(core_1.ScopeEnum.Request, { allowDowngrade: true })
], SessionService);
exports.SessionService = SessionService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2Vzc2lvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2aWNlL3Nlc3Npb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEseUNBQTJEO0FBQzNELHVEQUFtRDtBQUNuRCwwRUFBdU07QUFJaE0sSUFBTSxjQUFjLEdBQXBCLE1BQU0sY0FBZSxTQUFRLDBCQUFXO0lBRTNDOzs7O09BSUc7SUFDSCxLQUFLLENBQUMsZUFBZSxDQUFDLEVBQVU7UUFDNUIsTUFBTSxHQUFHLEdBQUcsSUFBSSw0QkFBa0IsRUFBRSxDQUFDO1FBQ3JDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBQ1osTUFBTSxHQUFHLEdBQUcsTUFBTSxJQUFJLENBQUMsY0FBYyxDQUFxQixHQUFHLENBQUMsQ0FBQztRQUMvRCxPQUFPLEdBQUcsRUFBRSxJQUFJLElBQUksSUFBSSxDQUFDO0lBQzdCLENBQUM7SUFDRDs7O09BR0c7SUFDSCxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQVU7UUFDbkIsTUFBTSxHQUFHLEdBQUcsSUFBSSxtQkFBUyxFQUFFLENBQUM7UUFDNUIsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7UUFDWixNQUFNLEdBQUcsR0FBRyxNQUFNLElBQUksQ0FBQyxjQUFjLENBQVksR0FBRyxDQUFDLENBQUM7UUFDdEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO1FBQy9CLE9BQU8sR0FBRyxDQUFDO0lBQ2YsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxLQUFLLENBQUMsU0FBUyxDQUFDLFdBQXlCO1FBQ3JDLE1BQU0sR0FBRyxHQUFHLElBQUksc0JBQVksRUFBRSxDQUFDO1FBQy9CLEdBQUcsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDMUIsTUFBTSxHQUFHLEdBQUcsTUFBTSxJQUFJLENBQUMsY0FBYyxDQUFlLEdBQUcsQ0FBQyxDQUFDO1FBQ3pELE9BQU8sR0FBRyxDQUFDO0lBQ2YsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxLQUFLLENBQUMsY0FBYyxDQUFDLFdBQThCO1FBQy9DLFdBQVcsQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDLENBQUEsa0RBQWtEO1FBRTFFLE1BQU0sR0FBRyxHQUFHLElBQUksMkJBQWlCLEVBQUUsQ0FBQztRQUNwQyxHQUFHLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzFCLE1BQU0sR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBb0IsR0FBRyxDQUFDLENBQUM7UUFDOUQsT0FBTyxHQUFHLENBQUM7SUFDZixDQUFDO0NBQ0osQ0FBQTtBQWxEWSxjQUFjO0lBRjFCLElBQUEsY0FBTyxHQUFFO0lBQ1QsSUFBQSxZQUFLLEVBQUMsZ0JBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxjQUFjLEVBQUUsSUFBSSxFQUFFLENBQUM7R0FDdEMsY0FBYyxDQWtEMUI7QUFsRFksd0NBQWMifQ==