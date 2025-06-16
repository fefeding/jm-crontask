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
exports.HomeController = void 0;
const core_1 = require("@midwayjs/core");
const session_1 = require("../service/session");
const devops_config_1 = require("../config/devops.config");
const decorator_1 = require("../lib/decorator");
let HomeController = class HomeController {
    ctx;
    sessionService;
    ssoOption;
    async login() {
        console.log('login render', this.ctx.path, this.ctx.auth_token);
        if (this.ctx.auth_token && this.ctx.path.includes('/logout')) {
            const res = await this.sessionService.logout(this.ctx.auth_token);
            console.log('logout', res);
            if (res.ret === 0) {
                this.ctx.cookies.set('token', '');
            }
        }
        return this.getDefaultTemplate('admin.html');
    }
    async admin() {
        return this.getDefaultTemplate('admin.html');
    }
    // @Get('/*')
    // async home(): Promise<string> {
    //     return this.getDefaultTemplate('index.html');
    // }
    // @Get('/')
    // async defaultToHome() {
    //     return this.getDefaultTemplate('index.html');
    // }
    /**
     * render模板
     * @param ctx
     * @param file
     * @returns
     */
    getDefaultTemplate(file = 'index.html') {
        // 前端端口，如果为空，说明就是开发环境了
        const viteTarget = process.env.VITE_PORT;
        const config = this.ctx.app.getConfig();
        const prefix = config.koa.globalPrefix;
        const data = {
            data: {
                config: {
                    prefix,
                },
                sso: this.ssoOption,
                session: this.ctx.currentSession || null,
                isManager: this.sessionService.checkManager(),
                jvCommon: config?.jvCommon,
                title: devops_config_1.default.siteTitle,
            },
            title: devops_config_1.default.siteTitle,
            env: process.env,
            viteTarget: viteTarget ? `//${this.ctx.hostname}:${viteTarget}` : '',
        };
        //console.log(file, data);
        return this.ctx.render(file, data);
    }
};
__decorate([
    (0, core_1.Inject)(),
    __metadata("design:type", Object)
], HomeController.prototype, "ctx", void 0);
__decorate([
    (0, core_1.Inject)(),
    __metadata("design:type", session_1.SessionService)
], HomeController.prototype, "sessionService", void 0);
__decorate([
    (0, core_1.Config)('sso'),
    __metadata("design:type", Object)
], HomeController.prototype, "ssoOption", void 0);
__decorate([
    (0, core_1.Get)('/admin/login'),
    (0, core_1.Get)('/admin/logout'),
    (0, decorator_1.checkLogin)(false),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HomeController.prototype, "login", null);
__decorate([
    (0, core_1.Get)('/*'),
    (0, core_1.Get)('/'),
    (0, decorator_1.checkLogin)(false) // 需要登陆态的接口
    ,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HomeController.prototype, "admin", null);
HomeController = __decorate([
    (0, core_1.Provide)(),
    (0, core_1.Controller)('/')
], HomeController);
exports.HomeController = HomeController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG9tZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb250cm9sbGVyL2hvbWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEseUNBQTBFO0FBRTFFLGdEQUFvRDtBQUNwRCwyREFBbUQ7QUFDbkQsZ0RBQThDO0FBSXZDLElBQU0sY0FBYyxHQUFwQixNQUFNLGNBQWM7SUFFdkIsR0FBRyxDQUFVO0lBR2IsY0FBYyxDQUFpQjtJQUUvQixTQUFTLENBQU07SUFLVCxBQUFOLEtBQUssQ0FBQyxLQUFLO1FBQ1AsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNoRSxJQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUN6RCxNQUFNLEdBQUcsR0FBRyxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDbEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDM0IsSUFBRyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUMsRUFBRTtnQkFDZCxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2FBQ3JDO1NBQ0o7UUFDRCxPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBS0ssQUFBTixLQUFLLENBQUMsS0FBSztRQUNQLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFFRCxhQUFhO0lBQ2Isa0NBQWtDO0lBQ2xDLG9EQUFvRDtJQUNwRCxJQUFJO0lBRUosWUFBWTtJQUNaLDBCQUEwQjtJQUMxQixvREFBb0Q7SUFDcEQsSUFBSTtJQUVKOzs7OztPQUtHO0lBQ0gsa0JBQWtCLENBQUMsSUFBSSxHQUFDLFlBQVk7UUFDaEMsc0JBQXNCO1FBQ3RCLE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDO1FBQ3pDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3hDLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDO1FBQ3ZDLE1BQU0sSUFBSSxHQUFHO1lBQ1QsSUFBSSxFQUFFO2dCQUNGLE1BQU0sRUFBRTtvQkFDSixNQUFNO2lCQUNUO2dCQUNmLEdBQUcsRUFBRSxJQUFJLENBQUMsU0FBUztnQkFDTCxPQUFPLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLElBQUUsSUFBSTtnQkFDdEMsU0FBUyxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsWUFBWSxFQUFFO2dCQUM3QyxRQUFRLEVBQUUsTUFBTSxFQUFFLFFBQVE7Z0JBQzFCLEtBQUssRUFBRSx1QkFBWSxDQUFDLFNBQVM7YUFDaEM7WUFDRCxLQUFLLEVBQUUsdUJBQVksQ0FBQyxTQUFTO1lBQzdCLEdBQUcsRUFBRSxPQUFPLENBQUMsR0FBRztZQUNoQixVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxJQUFJLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFO1NBQ3ZFLENBQUM7UUFDRiwwQkFBMEI7UUFDMUIsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDdkMsQ0FBQztDQUNKLENBQUE7QUFyRUc7SUFBQyxJQUFBLGFBQU0sR0FBRTs7MkNBQ0k7QUFFYjtJQUFDLElBQUEsYUFBTSxHQUFFOzhCQUNPLHdCQUFjO3NEQUFDO0FBQy9CO0lBQUMsSUFBQSxhQUFNLEVBQUMsS0FBSyxDQUFDOztpREFDQztBQUtUO0lBSEwsSUFBQSxVQUFHLEVBQUMsY0FBYyxDQUFDO0lBQ25CLElBQUEsVUFBRyxFQUFDLGVBQWUsQ0FBQztJQUNwQixJQUFBLHNCQUFVLEVBQUMsS0FBSyxDQUFDOzs7OzJDQVdqQjtBQUtLO0lBSEwsSUFBQSxVQUFHLEVBQUMsSUFBSSxDQUFDO0lBQ1QsSUFBQSxVQUFHLEVBQUMsR0FBRyxDQUFDO0lBQ1IsSUFBQSxzQkFBVSxFQUFDLEtBQUssQ0FBQyxDQUFBLFdBQVc7Ozs7OzJDQUc1QjtBQTdCUSxjQUFjO0lBRjFCLElBQUEsY0FBTyxHQUFFO0lBQ1QsSUFBQSxpQkFBVSxFQUFDLEdBQUcsQ0FBQztHQUNILGNBQWMsQ0FzRTFCO0FBdEVZLHdDQUFjIn0=