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
exports.BaseService = void 0;
const core_1 = require("@midwayjs/core");
const api_1 = require("@fefeding/common/dist/utils/api");
const request_1 = require("../lib/request");
class BaseService {
    app;
    ctx;
    baseServiceOption;
    // 登陆态验证配置
    apiOption;
    /**
     * 是否是管理员帐号
     * @param account
     */
    checkManager(account = this.ctx.currentSession?.account?.account) {
        return account && this.baseServiceOption.manager === account;
    }
    /**
     * 基础服务请求
     * @param req
     * @param option
     */
    async requestBaseApi(req, option) {
        option = {
            ...option,
            method: 'POST',
            baseURL: this.baseServiceOption.url,
        };
        const headers = option.headers || {};
        if (this.apiOption?.key) {
            const thisToken = api_1.default.createApiToken(this.apiOption.key);
            headers['x-api-token'] = thisToken.sign;
            headers['x-api-timestamp'] = thisToken.timestamp;
            /*if(typeof req === 'object') {
                req.api_token = thisToken.sign;
                req.timestamp = thisToken.timestamp;
            }*/
        }
        headers['x-request-id'] = this.ctx.request_id;
        headers['x-auth-token'] = this.ctx.currentSession?.id || '';
        option.headers = headers;
        const res = await (0, request_1.requestApi)(req, option);
        return res;
    }
}
__decorate([
    (0, core_1.App)(),
    __metadata("design:type", Object)
], BaseService.prototype, "app", void 0);
__decorate([
    (0, core_1.Inject)(),
    __metadata("design:type", Object)
], BaseService.prototype, "ctx", void 0);
__decorate([
    (0, core_1.Config)('baseService'),
    __metadata("design:type", Object)
], BaseService.prototype, "baseServiceOption", void 0);
__decorate([
    (0, core_1.Config)('apiOption'),
    __metadata("design:type", Object)
], BaseService.prototype, "apiOption", void 0);
exports.BaseService = BaseService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2Jhc2UvYmFzZS5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHlDQUFxRDtBQUtyRCx5REFBa0Q7QUFDbEQsNENBQTRDO0FBRTVDLE1BQWEsV0FBVztJQUVWLEdBQUcsQ0FBYztJQUdwQixHQUFHLENBQVU7SUFHcEIsaUJBQWlCLENBSWhCO0lBQ0QsVUFBVTtJQUVWLFNBQVMsQ0FFUDtJQUVGOzs7T0FHRztJQUNILFlBQVksQ0FBQyxVQUFrQixJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSxPQUFPLEVBQUUsT0FBTztRQUNwRSxPQUFPLE9BQU8sSUFBSSxJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxLQUFLLE9BQU8sQ0FBQztJQUNqRSxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILEtBQUssQ0FBQyxjQUFjLENBQXFCLEdBQW1CLEVBQUUsTUFBMkI7UUFDckYsTUFBTSxHQUFHO1lBQ0wsR0FBRyxNQUFNO1lBQ1QsTUFBTSxFQUFFLE1BQU07WUFDZCxPQUFPLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUc7U0FDaEIsQ0FBQztRQUV4QixNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQztRQUNyQyxJQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsR0FBRyxFQUFFO1lBQ3BCLE1BQU0sU0FBUyxHQUFHLGFBQUcsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN6RCxPQUFPLENBQUMsYUFBYSxDQUFDLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQztZQUN4QyxPQUFPLENBQUMsaUJBQWlCLENBQUMsR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDO1lBRWpEOzs7ZUFHRztTQUNOO1FBQ0QsT0FBTyxDQUFDLGNBQWMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDO1FBQzlDLE9BQU8sQ0FBQyxjQUFjLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDO1FBRTVELE1BQU0sQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBRXpCLE1BQU0sR0FBRyxHQUFHLE1BQU0sSUFBQSxvQkFBVSxFQUFJLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUM3QyxPQUFPLEdBQUcsQ0FBQztJQUNmLENBQUM7Q0FDSjtBQXpERztJQUFDLElBQUEsVUFBRyxHQUFFOzt3Q0FDcUI7QUFFM0I7SUFBQyxJQUFBLGFBQU0sR0FBRTs7d0NBQ1c7QUFFcEI7SUFBQyxJQUFBLGFBQU0sRUFBQyxhQUFhLENBQUM7O3NEQUtyQjtBQUVEO0lBQUMsSUFBQSxhQUFNLEVBQUMsV0FBVyxDQUFDOzs4Q0FHbEI7QUFqQk4sa0NBMERDIn0=