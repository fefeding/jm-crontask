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
exports.ApiGuard = void 0;
const core_1 = require("@midwayjs/core");
const decorator_1 = require("../lib/decorator");
const api_1 = require("@fefeding/common/dist/utils/api");
/**
 * 对于需要token的接口，从query或body或cookie中取token，是否跟本服务的一致
 */
let ApiGuard = class ApiGuard {
    // 登陆态验证配置
    apiOption;
    async canActivate(context, supplierClz, methodName) {
        // 获取是否需要检查token
        const needToken = (0, decorator_1.getApiToken)(supplierClz, methodName);
        if (needToken) {
            await this.checkApiToken(context);
        }
        return true;
    }
    // 校验是否有带api token
    async checkApiToken(context) {
        const body = (context.request.body || {});
        const reqToken = context.URL.searchParams.get('api_token') ||
            context.request.header['x-api-token'] ||
            body.api_token ||
            context.cookies.get('api_token');
        const timestamp = Number(context.URL.searchParams.get('timestamp') ||
            context.request.header['x-api-timestamp'] ||
            body.timestamp ||
            context.cookies.get('timestamp'));
        if (!reqToken || !timestamp) {
            context.logger.error(`token为空，非法请求, token: ${reqToken}, timestamp: ${timestamp}`);
            throw Error('token为空，非法请求');
        }
        //const time = new Date(timestamp);
        console.log('token time', reqToken, timestamp);
        // 如果超过一定时间，则失效
        if (timestamp < Date.now() - 5 * 60 * 1000) {
            throw Error('timestamp已超过有效时间');
        }
        const thisToken = api_1.default.createApiToken(this.apiOption.key, timestamp);
        if (reqToken !== thisToken.sign) {
            context.logger.error(`输入token:${reqToken}  本地: ${thisToken.sign} 不一致`);
            throw Error('token输入错误');
        }
    }
};
__decorate([
    (0, core_1.Config)('apiOption'),
    __metadata("design:type", Object)
], ApiGuard.prototype, "apiOption", void 0);
ApiGuard = __decorate([
    (0, core_1.Guard)()
], ApiGuard);
exports.ApiGuard = ApiGuard;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2d1YXJkL2FwaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSx5Q0FBdUQ7QUFFdkQsZ0RBQStDO0FBQy9DLHlEQUFrRDtBQUVsRDs7R0FFRztBQUVJLElBQU0sUUFBUSxHQUFkLE1BQU0sUUFBUTtJQUNqQixVQUFVO0lBRVYsU0FBUyxDQUVQO0lBRUYsS0FBSyxDQUFDLFdBQVcsQ0FDYixPQUFnQixFQUNoQixXQUFXLEVBQ1gsVUFBa0I7UUFFbEIsZ0JBQWdCO1FBQ2hCLE1BQU0sU0FBUyxHQUFHLElBQUEsdUJBQVcsRUFBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFFdkQsSUFBSSxTQUFTLEVBQUU7WUFDWCxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDckM7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQsa0JBQWtCO0lBQ2xCLEtBQUssQ0FBQyxhQUFhLENBQUMsT0FBZ0I7UUFDaEMsTUFBTSxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSSxFQUFFLENBQVEsQ0FBQztRQUNqRCxNQUFNLFFBQVEsR0FDVixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDO1lBQ3pDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQztZQUNyQyxJQUFJLENBQUMsU0FBUztZQUNkLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3JDLE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FDcEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQztZQUN6QyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQztZQUNyQyxJQUFJLENBQUMsU0FBUztZQUNkLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUN2QyxDQUFDO1FBQ0YsSUFBSSxDQUFDLFFBQVEsSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUN6QixPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FDaEIsd0JBQXdCLFFBQVEsZ0JBQWdCLFNBQVMsRUFBRSxDQUM5RCxDQUFDO1lBQ0YsTUFBTSxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUM7U0FDL0I7UUFFRCxtQ0FBbUM7UUFDbkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsUUFBUSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQy9DLGVBQWU7UUFDZixJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLEVBQUU7WUFDeEMsTUFBTSxLQUFLLENBQUMsa0JBQWtCLENBQUMsQ0FBQztTQUNuQztRQUVELE1BQU0sU0FBUyxHQUFHLGFBQUcsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFFcEUsSUFBSSxRQUFRLEtBQUssU0FBUyxDQUFDLElBQUksRUFBRTtZQUM3QixPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FDaEIsV0FBVyxRQUFRLFNBQVMsU0FBUyxDQUFDLElBQUksTUFBTSxDQUNuRCxDQUFDO1lBQ0YsTUFBTSxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7U0FDNUI7SUFDTCxDQUFDO0NBQ0osQ0FBQTtBQXhERztJQUFDLElBQUEsYUFBTSxFQUFDLFdBQVcsQ0FBQzs7MkNBR2xCO0FBTE8sUUFBUTtJQURwQixJQUFBLFlBQUssR0FBRTtHQUNLLFFBQVEsQ0EwRHBCO0FBMURZLDRCQUFRIn0=