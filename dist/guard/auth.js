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
exports.AuthGuard = void 0;
const core_1 = require("@midwayjs/core");
const session_1 = require("../service/session");
const decorator_1 = require("../lib/decorator");
const devops_config_1 = require("../config/devops.config");
const utils_1 = require("../lib/utils");
// 校验api路径规则的
const apiReg = /^\/([^/]+\/)?api\//i;
/**
 * 校验请求的登陆态
 */
let AuthGuard = class AuthGuard {
    sessionService;
    async canActivate(context, supplierClz, methodName) {
        // 获取是否需要检查登陆态
        const needAuth = (0, decorator_1.getCheckLogin)(supplierClz, methodName);
        const token = (0, utils_1.getAuthToken)(context);
        if (token)
            context.auth_token = token;
        const ret = await this.checkAuth(context, token, needAuth);
        return ret;
    }
    // 校验是否有带api token
    async checkAuth(context, token, needAuth) {
        this.sessionService.ctx = context;
        const authRet = 50001;
        //console.log(context.cookies);
        let errRes = null;
        try {
            let session = null;
            if (!token) {
                //context.status = 403;
                // 如果是从登陆回来，则验证监时码
                const authCode = context.URL.searchParams.get('auth_code');
                if (authCode) {
                    const res = await this.sessionService.loginByCode(authCode);
                    if (res.ret === 0) {
                        session = res.data;
                        // 登陆写入cookie
                        (0, utils_1.setAuthToken)(context, session.id);
                        context.URL.searchParams.delete('auth_code'); // 移除auth_code参数
                        context.URL.hostname = context.detect?.HOSTNAME || context.hostname;
                        const url = context.URL.toString();
                        context.redirect(url);
                        return true;
                    }
                }
                if (!session) {
                    errRes = {
                        ret: authRet,
                        msg: '需要登陆态',
                    };
                }
            }
            if (token && !errRes && !session) {
                session = await this.sessionService.getLoginSession(token);
                if (!session || !session.id) {
                    (0, utils_1.setAuthToken)(context, '');
                    //context.status = 403;
                    errRes = {
                        ret: authRet,
                        msg: 'token不存在或已过期',
                    };
                }
            }
            // 登陆态挂载到当前上下文
            context.currentSession = session;
            if (errRes && needAuth) {
                this.authError(context, errRes);
            }
        }
        catch (e) {
            console.error(e);
            errRes = {
                ret: authRet,
                msg: e.message || 'auth error',
            };
            if (needAuth)
                this.authError(context, errRes);
        }
        return true;
    }
    // 异常处理
    authError(context, error) {
        if (apiReg.test(context.path)) {
            context.status = 200;
            context.res.write('', 'utf8');
            throw error;
        }
        else {
            context.redirect(`${devops_config_1.default.prefixUrl}/login`);
        }
    }
};
__decorate([
    (0, core_1.Inject)(),
    __metadata("design:type", session_1.SessionService)
], AuthGuard.prototype, "sessionService", void 0);
AuthGuard = __decorate([
    (0, core_1.Guard)()
], AuthGuard);
exports.AuthGuard = AuthGuard;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ndWFyZC9hdXRoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHlDQUF1RDtBQUV2RCxnREFBb0Q7QUFDcEQsZ0RBQWlEO0FBQ2pELDJEQUFtRDtBQUNuRCx3Q0FBMEQ7QUFFMUQsYUFBYTtBQUNiLE1BQU0sTUFBTSxHQUFHLHFCQUFxQixDQUFDO0FBRXJDOztHQUVHO0FBRUksSUFBTSxTQUFTLEdBQWYsTUFBTSxTQUFTO0lBRWxCLGNBQWMsQ0FBaUI7SUFFL0IsS0FBSyxDQUFDLFdBQVcsQ0FDYixPQUFnQixFQUNoQixXQUFXLEVBQ1gsVUFBa0I7UUFFbEIsY0FBYztRQUNkLE1BQU0sUUFBUSxHQUFHLElBQUEseUJBQWEsRUFBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDeEQsTUFBTSxLQUFLLEdBQUcsSUFBQSxvQkFBWSxFQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3BDLElBQUcsS0FBSztZQUFFLE9BQU8sQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO1FBRXJDLE1BQU0sR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQzNELE9BQU8sR0FBRyxDQUFDO0lBQ2YsQ0FBQztJQUVELGtCQUFrQjtJQUNsQixLQUFLLENBQUMsU0FBUyxDQUFDLE9BQWdCLEVBQUUsS0FBYSxFQUFFLFFBQWtCO1FBQy9ELElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxHQUFHLE9BQU8sQ0FBQztRQUNsQyxNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUM7UUFDdEIsK0JBQStCO1FBRS9CLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQztRQUNsQixJQUFJO1lBQ0EsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDO1lBQ25CLElBQUksQ0FBQyxLQUFLLEVBQUU7Z0JBQ1IsdUJBQXVCO2dCQUN2Qixr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