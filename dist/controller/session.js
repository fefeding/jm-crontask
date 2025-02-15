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
exports.SessionController = void 0;
const core_1 = require("@midwayjs/core");
const base_controller_1 = require("../base/base.controller");
const session_1 = require("../service/session");
//import { checkApiToken } from '../lib/decorator';
let SessionController = class SessionController extends base_controller_1.BaseController {
    sessionService;
    // 接口需要验证token
    async loginByWx(loginParams) {
        const res = await this.sessionService.loginByWx(loginParams);
        if (res.ret === 0 && res.data) {
            this.ctx.cookies.set('token', res.data.id); // 写入cookie
            return {
                ...res.data,
            };
        }
        return res;
    }
    // 接口需要验证token
    async loginByAccount(loginParams) {
        const res = await this.sessionService.loginByAccount(loginParams);
        if (res.ret === 0 && res.data) {
            this.ctx.cookies.set('token', res.data.id); // 写入cookie
            return {
                ...res.data,
            };
        }
        return res;
    }
};
__decorate([
    (0, core_1.Inject)(),
    __metadata("design:type", session_1.SessionService)
], SessionController.prototype, "sessionService", void 0);
__decorate([
    (0, core_1.All)('/loginByWx'),
    __param(0, (0, core_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SessionController.prototype, "loginByWx", null);
__decorate([
    (0, core_1.All)('/loginByAccount'),
    __param(0, (0, core_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SessionController.prototype, "loginByAccount", null);
SessionController = __decorate([
    (0, core_1.Provide)(),
    (0, core_1.Controller)('/api/session')
], SessionController);
exports.SessionController = SessionController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2Vzc2lvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb250cm9sbGVyL3Nlc3Npb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEseUNBQXlFO0FBQ3pFLDZEQUF5RDtBQUN6RCxnREFBb0Q7QUFDcEQsbURBQW1EO0FBSTVDLElBQU0saUJBQWlCLEdBQXZCLE1BQU0saUJBQWtCLFNBQVEsZ0NBQWM7SUFFakQsY0FBYyxDQUFpQjtJQUUvQixjQUFjO0lBRVIsQUFBTixLQUFLLENBQUMsU0FBUyxDQUFTLFdBQWdCO1FBRXBDLE1BQU0sR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDN0QsSUFBRyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUMsSUFBSSxHQUFHLENBQUMsSUFBSSxFQUFFO1lBQzFCLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBLFdBQVc7WUFDdEQsT0FBTztnQkFDSCxHQUFHLEdBQUcsQ0FBQyxJQUFJO2FBQ2QsQ0FBQTtTQUNKO1FBQ0QsT0FBTyxHQUFHLENBQUM7SUFDZixDQUFDO0lBRUQsY0FBYztJQUVSLEFBQU4sS0FBSyxDQUFDLGNBQWMsQ0FBUyxXQUFnQjtRQUN6QyxNQUFNLEdBQUcsR0FBRyxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ2xFLElBQUcsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDLElBQUksR0FBRyxDQUFDLElBQUksRUFBRTtZQUMxQixJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQSxXQUFXO1lBQ3RELE9BQU87Z0JBQ0gsR0FBRyxHQUFHLENBQUMsSUFBSTthQUNkLENBQUE7U0FDSjtRQUNELE9BQU8sR0FBRyxDQUFDO0lBQ2YsQ0FBQztDQUNKLENBQUE7QUE3Qkc7SUFBQyxJQUFBLGFBQU0sR0FBRTs4QkFDTyx3QkFBYzt5REFBQztBQUl6QjtJQURMLElBQUEsVUFBRyxFQUFDLFlBQVksQ0FBQztJQUNELFdBQUEsSUFBQSxXQUFJLEdBQUUsQ0FBQTs7OztrREFVdEI7QUFJSztJQURMLElBQUEsVUFBRyxFQUFDLGlCQUFpQixDQUFDO0lBQ0QsV0FBQSxJQUFBLFdBQUksR0FBRSxDQUFBOzs7O3VEQVMzQjtBQTdCUSxpQkFBaUI7SUFGN0IsSUFBQSxjQUFPLEdBQUU7SUFDVCxJQUFBLGlCQUFVLEVBQUMsY0FBYyxDQUFDO0dBQ2QsaUJBQWlCLENBOEI3QjtBQTlCWSw4Q0FBaUIifQ==