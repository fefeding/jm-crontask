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
exports.SessionService = void 0;
const core_1 = require("@midwayjs/core");
const cache_manager_1 = require("@midwayjs/cache-manager");
const base_service_1 = require("../base/base.service");
const session_1 = require("@fefeding/common/dist/models/account/session");
let SessionService = class SessionService extends base_service_1.BaseService {
    sessionCache;
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
    /**
     * 用临时码登陆
     * @param code 登陆临时码
     * @returns
     */
    async loginByCode(code) {
        const res = await this.requestBaseApi('/api/session/loginByAuthCode', {
            data: {
                code
            }
        });
        return res;
    }
};
__decorate([
    (0, core_1.InjectClient)(cache_manager_1.CachingFactory, 'session'),
    __metadata("design:type", Object)
], SessionService.prototype, "sessionCache", void 0);
SessionService = __decorate([
    (0, core_1.Provide)(),
    (0, core_1.Scope)(core_1.ScopeEnum.Request, { allowDowngrade: true })
], SessionService);
exports.SessionService = SessionService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2Vzc2lvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2aWNlL3Nlc3Npb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEseUNBQXlFO0FBQ3pFLDJEQUFzRTtBQUN0RSx1REFBbUQ7QUFDbkQsMEVBQXVNO0FBSWhNLElBQU0sY0FBYyxHQUFwQixNQUFNLGNBQWUsU0FBUSwwQkFBVztJQUczQyxZQUFZLENBQWM7SUFFMUI7Ozs7T0FJRztJQUNILEtBQUssQ0FBQyxlQUFlLENBQUMsRUFBVTtRQUM1QixNQUFNLEdBQUcsR0FBRyxJQUFJLDRCQUFrQixFQUFFLENBQUM7UUFDckMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7UUFDWixNQUFNLEdBQUcsR0FBRyxNQUFNLElBQUksQ0FBQyxjQUFjLENBQXFCLEdBQUcsQ0FBQyxDQUFDO1FBQy9ELE9BQU8sR0FBRyxFQUFFLElBQUksSUFBSSxJQUFJLENBQUM7SUFDN0IsQ0FBQztJQUNEOzs7T0FHRztJQUNILEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBVTtRQUNuQixNQUFNLEdBQUcsR0FBRyxJQUFJLG1CQUFTLEVBQUUsQ0FBQztRQUM1QixHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztRQUNaLE1BQU0sR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBWSxHQUFHLENBQUMsQ0FBQztRQUN0RCxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7UUFDL0IsT0FBTyxHQUFHLENBQUM7SUFDZixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILEtBQUssQ0FBQyxTQUFTLENBQUMsV0FBeUI7UUFDckMsTUFBTSxHQUFHLEdBQUcsSUFBSSxzQkFBWSxFQUFFLENBQUM7UUFDL0IsR0FBRyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUMxQixNQUFNLEdBQUcsR0FBRyxNQUFNLElBQUksQ0FBQyxjQUFjLENBQWUsR0FBRyxDQUFDLENBQUM7UUFDekQsT0FBTyxHQUFHLENBQUM7SUFDZixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILEtBQUssQ0FBQyxjQUFjLENBQUMsV0FBOEI7UUFDL0MsV0FBVyxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQSxrREFBa0Q7UUFFMUUsTUFBTSxHQUFHLEdBQUcsSUFBSSwyQkFBaUIsRUFBRSxDQUFDO1FBQ3BDLEdBQUcsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDMUIsTUFBTSxHQUFHLEdBQUcsTUFBTSxJQUFJLENBQUMsY0FBYyxDQUFvQixHQUFHLENBQUMsQ0FBQztRQUM5RCxPQUFPLEdBQUcsQ0FBQztJQUNmLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFZO1FBQzFCLE1BQU0sR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyw4QkFBOEIsRUFBRTtZQUNsRSxJQUFJLEVBQUU7Z0JBQ0YsSUFBSTthQUNQO1NBQ0osQ0FBQyxDQUFDO1FBQ0gsT0FBTyxHQUFHLENBQUM7SUFDZixDQUFDO0NBQ0osQ0FBQTtBQWpFRztJQUFDLElBQUEsbUJBQVksRUFBQyw4QkFBYyxFQUFFLFNBQVMsQ0FBQzs7b0RBQ2Q7QUFIakIsY0FBYztJQUYxQixJQUFBLGNBQU8sR0FBRTtJQUNULElBQUEsWUFBSyxFQUFDLGdCQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsY0FBYyxFQUFFLElBQUksRUFBRSxDQUFDO0dBQ3RDLGNBQWMsQ0FtRTFCO0FBbkVZLHdDQUFjIn0=