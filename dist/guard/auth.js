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
        const body = (context.request.body || {});
        const token = context.URL.searchParams.get('token') ||
            context.request.header['x-auth-token'] ||
            body.token ||
            context.cookies.get('token', {
                signed: false,
            });
        if (token)
            context.auth_token = token;
        console.log(needAuth, token);
        if (needAuth) {
            const ret = await this.checkAuth(context, token);
            return ret;
        }
        return true;
    }
    // 校验是否有带api token
    async checkAuth(context, token) {
        this.sessionService.ctx = context;
        const authRet = 50001;
        //console.log(context.cookies);
        let errRes = null;
        if (!token) {
            //context.status = 403;
            errRes = {
                ret: authRet,
                msg: '需要登陆态',
            };
        }
        let session = null;
        if (token && !errRes) {
            session = await this.sessionService.getLoginSession(token);
            if (!session) {
                //context.status = 403;
                errRes = {
                    ret: authRet,
                    msg: 'token不存在或已过期',
                };
            }
            else {
                // 登陆态挂载到当前上下文
                context.currentSession = session;
                //console.log(session);
            }
        }
        if (errRes) {
            console.log(errRes, context.path);
            if (apiReg.test(context.path)) {
                context.status = 200;
                context.res.write('', 'utf8');
                throw errRes;
            }
            else {
                context.redirect(`${devops_config_1.default.prefixUrl}/admin/login`);
            }
        }
        return true;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ndWFyZC9hdXRoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHlDQUF1RDtBQUV2RCxnREFBb0Q7QUFDcEQsZ0RBQWlEO0FBQ2pELDJEQUFtRDtBQUVuRCxhQUFhO0FBQ2IsTUFBTSxNQUFNLEdBQUcscUJBQXFCLENBQUM7QUFFckM7O0dBRUc7QUFFSSxJQUFNLFNBQVMsR0FBZixNQUFNLFNBQVM7SUFFbEIsY0FBYyxDQUFpQjtJQUUvQixLQUFLLENBQUMsV0FBVyxDQUNiLE9BQWdCLEVBQ2hCLFdBQVcsRUFDWCxVQUFrQjtRQUVsQixjQUFjO1FBQ2QsTUFBTSxRQUFRLEdBQUcsSUFBQSx5QkFBYSxFQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUN4RCxNQUFNLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBUSxDQUFDO1FBQ2pELE1BQU0sS0FBSyxHQUNQLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUM7WUFDckMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDO1lBQ3RDLElBQUksQ0FBQyxLQUFLO1lBQ1YsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFO2dCQUN6QixNQUFNLEVBQUUsS0FBSzthQUNoQixDQUFDLENBQUM7UUFDUCxJQUFHLEtBQUs7WUFBRSxPQUFPLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztRQUNyQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM3QixJQUFJLFFBQVEsRUFBRTtZQUNWLE1BQU0sR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDakQsT0FBTyxHQUFHLENBQUM7U0FDZDtRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRCxrQkFBa0I7SUFDbEIsS0FBSyxDQUFDLFNBQVMsQ0FBQyxPQUFnQixFQUFFLEtBQWE7UUFDM0MsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLEdBQUcsT0FBTyxDQUFDO1FBQ2xDLE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQztRQUN0QiwrQkFBK0I7UUFFL0IsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDO1FBQ2xCLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDUix1QkFBdUI7WUFDdkIsTUFBTSxHQUFHO2dCQUNMLEdBQUcsRUFBRSxPQUFPO2dCQUNaLEdBQUcsRUFBRSxPQUFPO2FBQ2YsQ0FBQztTQUNMO1FBRUQsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDO1FBQ25CLElBQUksS0FBSyxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ2xCLE9BQU8sR0FBRyxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzNELElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ1YsdUJBQXVCO2dCQUN2QixNQUFNLEdBQUc7b0JBQ0wsR0FBRyxFQUFFLE9BQU87b0JBQ1osR0FBRyxFQUFFLGNBQWM7aUJBQ3RCLENBQUM7YUFDTDtpQkFDSTtnQkFDRCxjQUFjO2dCQUNkLE9BQU8sQ0FBQyxjQUFjLEdBQUcsT0FBTyxDQUFDO2dCQUNqQyx1QkFBdUI7YUFDMUI7U0FDSjtRQUVELElBQUcsTUFBTSxFQUFFO1lBQ1AsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2xDLElBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQzFCLE9BQU8sQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDO2dCQUNyQixPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQzlCLE1BQU0sTUFBTSxDQUFDO2FBQ2hCO2lCQUNJO2dCQUNELE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyx1QkFBWSxDQUFDLFNBQVMsY0FBYyxDQUFDLENBQUM7YUFDN0Q7U0FDSjtRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7Q0FDSixDQUFBO0FBeEVHO0lBQUMsSUFBQSxhQUFNLEdBQUU7OEJBQ08sd0JBQWM7aURBQUM7QUFGdEIsU0FBUztJQURyQixJQUFBLFlBQUssR0FBRTtHQUNLLFNBQVMsQ0F5RXJCO0FBekVZLDhCQUFTIn0=