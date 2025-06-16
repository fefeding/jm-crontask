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
exports.ContainerLifeCycle = void 0;
const core_1 = require("@midwayjs/core");
const koa = require("@midwayjs/koa");
const validate = require("@midwayjs/validate");
const info = require("@midwayjs/info");
const axios = require("@midwayjs/axios");
const dotenv = require("dotenv");
//import * as swagger from '@midwayjs/swagger';
const orm = require("@midwayjs/typeorm");
const path_1 = require("path");
// import { DefaultErrorFilter } from './filter/default.filter';
const notfound_filter_1 = require("./filter/notfound.filter");
const apiResultFormatter_1 = require("./middleware/apiResultFormatter");
const requestInit_1 = require("./middleware/requestInit");
const pino_middleware_1 = require("./middleware/pino.middleware");
const view = require("@midwayjs/view-nunjucks");
const staticFile = require("@midwayjs/static-file");
const cacheManager = require("@midwayjs/cache-manager");
const devops_config_1 = require("./config/devops.config");
const api_1 = require("./guard/api");
const auth_1 = require("./guard/auth");
const detect_1 = require("./guard/detect");
// import * as core from '@jt/midway-core';
// load .env file in process.cwd
dotenv.config();
let ContainerLifeCycle = class ContainerLifeCycle {
    app;
    framework;
    async onConfigLoad(container) { }
    async onReady() {
        process.env.SERVICE_NAME = process.env.SERVICE_NAME || this.app.getProjectName();
        // 接口守位
        this.app.useGuard([
            detect_1.DetectGuard,
            api_1.ApiGuard,
            auth_1.AuthGuard
        ]);
        // add middleware
        this.app.useMiddleware([
            requestInit_1.RequestInitMiddleware,
            pino_middleware_1.PinoLoggerMiddleware,
            apiResultFormatter_1.ApiResultFormatterMiddleware,
        ]);
        // add filter
        this.app.useFilter([notfound_filter_1.NotFoundFilter]);
    }
    async onServerReady() {
        if (process.env.NODE_ENV !== 'production') {
            console.log(`请访问 http://${process.env.IP || '127.0.0.1'}:${process.env.PORT || 7001}${devops_config_1.default.prefixUrl}/`);
        }
    }
};
__decorate([
    (0, core_1.App)(),
    __metadata("design:type", Object)
], ContainerLifeCycle.prototype, "app", void 0);
__decorate([
    (0, core_1.Inject)(),
    __metadata("design:type", koa.Framework)
], ContainerLifeCycle.prototype, "framework", void 0);
ContainerLifeCycle = __decorate([
    (0, core_1.Configuration)({
        imports: [
            koa,
            validate,
            {
                component: info,
                enabledEnvironment: ['local'],
            },
            view,
            staticFile,
            axios,
            orm,
            cacheManager,
            //swagger,
        ],
        importConfigs: [(0, path_1.join)(__dirname, './config')],
    })
], ContainerLifeCycle);
exports.ContainerLifeCycle = ContainerLifeCycle;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9jb25maWd1cmF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHlDQUE0RDtBQUM1RCxxQ0FBcUM7QUFDckMsK0NBQStDO0FBQy9DLHVDQUF1QztBQUN2Qyx5Q0FBeUM7QUFDekMsaUNBQWlDO0FBQ2pDLCtDQUErQztBQUMvQyx5Q0FBeUM7QUFDekMsK0JBQTRCO0FBQzVCLGdFQUFnRTtBQUNoRSw4REFBMEQ7QUFDMUQsd0VBQStFO0FBQy9FLDBEQUFpRTtBQUNqRSxrRUFBb0U7QUFDcEUsZ0RBQWdEO0FBQ2hELG9EQUFvRDtBQUNwRCx3REFBd0Q7QUFDeEQsMERBQWtEO0FBQ2xELHFDQUF1QztBQUN2Qyx1Q0FBeUM7QUFDekMsMkNBQTZDO0FBQzdDLDJDQUEyQztBQUUzQyxnQ0FBZ0M7QUFDaEMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBbUJULElBQU0sa0JBQWtCLEdBQXhCLE1BQU0sa0JBQWtCO0lBRTNCLEdBQUcsQ0FBa0I7SUFHckIsU0FBUyxDQUFnQjtJQUV6QixLQUFLLENBQUMsWUFBWSxDQUFDLFNBQVMsSUFBRyxDQUFDO0lBRWhDLEtBQUssQ0FBQyxPQUFPO1FBQ1QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUNqRixPQUFPO1FBQ1AsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUM7WUFDZCxvQkFBVztZQUNYLGNBQVE7WUFDUixnQkFBUztTQUNaLENBQUMsQ0FBQztRQUVILGlCQUFpQjtRQUNqQixJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQztZQUNuQixtQ0FBcUI7WUFDckIsc0NBQW9CO1lBQ3BCLGlEQUE0QjtTQUMvQixDQUFDLENBQUM7UUFDSCxhQUFhO1FBQ2IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxnQ0FBYyxDQUFDLENBQUMsQ0FBQztJQUN6QyxDQUFDO0lBRUQsS0FBSyxDQUFDLGFBQWE7UUFDZixJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxLQUFLLFlBQVksRUFBRTtZQUN2QyxPQUFPLENBQUMsR0FBRyxDQUNQLGNBQWMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksV0FBVyxJQUN2QyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxJQUN4QixHQUFHLHVCQUFZLENBQUMsU0FBUyxHQUFHLENBQy9CLENBQUM7U0FDTDtJQUNMLENBQUM7Q0FDSixDQUFBO0FBcENHO0lBQUMsSUFBQSxVQUFHLEdBQUU7OytDQUNlO0FBRXJCO0lBQUMsSUFBQSxhQUFNLEdBQUU7OEJBQ0UsR0FBRyxDQUFDLFNBQVM7cURBQUM7QUFMaEIsa0JBQWtCO0lBakI5QixJQUFBLG9CQUFhLEVBQUM7UUFDWCxPQUFPLEVBQUU7WUFDTCxHQUFHO1lBQ0gsUUFBUTtZQUNSO2dCQUNJLFNBQVMsRUFBRSxJQUFJO2dCQUNmLGtCQUFrQixFQUFFLENBQUMsT0FBTyxDQUFDO2FBQ2hDO1lBQ0QsSUFBSTtZQUNKLFVBQVU7WUFDVixLQUFLO1lBQ0wsR0FBRztZQUNILFlBQVk7WUFDWixVQUFVO1NBQ2I7UUFDRCxhQUFhLEVBQUUsQ0FBQyxJQUFBLFdBQUksRUFBQyxTQUFTLEVBQUUsVUFBVSxDQUFDLENBQUM7S0FDL0MsQ0FBQztHQUNXLGtCQUFrQixDQXFDOUI7QUFyQ1ksZ0RBQWtCIn0=