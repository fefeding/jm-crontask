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
//import * as swagger from '@midwayjs/swagger';
const orm = require("@midwayjs/typeorm");
const path_1 = require("path");
// import { DefaultErrorFilter } from './filter/default.filter';
// import { NotFoundFilter } from './filter/notfound.filter';
const report_middleware_1 = require("./middleware/report.middleware");
const apiResultFormatter_1 = require("./middleware/apiResultFormatter");
const requestInit_1 = require("./middleware/requestInit");
const view = require("@midwayjs/view-nunjucks");
const staticFile = require("@midwayjs/static-file");
const devops_config_1 = require("./config/devops.config");
const api_1 = require("./guard/api");
const auth_1 = require("./guard/auth");
// import * as core from '@jt/midway-core';
let ContainerLifeCycle = class ContainerLifeCycle {
    app;
    framework;
    async onConfigLoad(container) { }
    async onReady() {
        // 接口守位
        this.app.useGuard([api_1.ApiGuard, auth_1.AuthGuard]);
        // add middleware
        this.app.useMiddleware([
            requestInit_1.RequestInitMiddleware,
            report_middleware_1.ReportMiddleware,
            apiResultFormatter_1.ApiResultFormatterMiddleware,
        ]);
        // add filter
        // this.app.useFilter([NotFoundFilter, DefaultErrorFilter]);
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
            //swagger,
        ],
        importConfigs: [(0, path_1.join)(__dirname, './config')],
    })
], ContainerLifeCycle);
exports.ContainerLifeCycle = ContainerLifeCycle;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9jb25maWd1cmF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHlDQUE0RDtBQUM1RCxxQ0FBcUM7QUFDckMsK0NBQStDO0FBQy9DLHVDQUF1QztBQUN2Qyx5Q0FBeUM7QUFDekMsK0NBQStDO0FBQy9DLHlDQUF5QztBQUN6QywrQkFBNEI7QUFDNUIsZ0VBQWdFO0FBQ2hFLDZEQUE2RDtBQUM3RCxzRUFBa0U7QUFDbEUsd0VBQStFO0FBQy9FLDBEQUFpRTtBQUNqRSxnREFBZ0Q7QUFDaEQsb0RBQW9EO0FBQ3BELDBEQUFrRDtBQUNsRCxxQ0FBdUM7QUFDdkMsdUNBQXlDO0FBQ3pDLDJDQUEyQztBQWlCcEMsSUFBTSxrQkFBa0IsR0FBeEIsTUFBTSxrQkFBa0I7SUFFM0IsR0FBRyxDQUFrQjtJQUdyQixTQUFTLENBQWdCO0lBRXpCLEtBQUssQ0FBQyxZQUFZLENBQUMsU0FBUyxJQUFHLENBQUM7SUFFaEMsS0FBSyxDQUFDLE9BQU87UUFDVCxPQUFPO1FBQ1AsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxjQUFRLEVBQUUsZ0JBQVMsQ0FBQyxDQUFDLENBQUM7UUFFekMsaUJBQWlCO1FBQ2pCLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDO1lBQ25CLG1DQUFxQjtZQUNyQixvQ0FBZ0I7WUFDaEIsaURBQTRCO1NBQy9CLENBQUMsQ0FBQztRQUNILGFBQWE7UUFDYiw0REFBNEQ7SUFDaEUsQ0FBQztJQUVELEtBQUssQ0FBQyxhQUFhO1FBQ2YsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsS0FBSyxZQUFZLEVBQUU7WUFDdkMsT0FBTyxDQUFDLEdBQUcsQ0FDUCxjQUFjLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLFdBQVcsSUFDdkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksSUFDeEIsR0FBRyx1QkFBWSxDQUFDLFNBQVMsR0FBRyxDQUMvQixDQUFDO1NBQ0w7SUFDTCxDQUFDO0NBQ0osQ0FBQTtBQS9CRztJQUFDLElBQUEsVUFBRyxHQUFFOzsrQ0FDZTtBQUVyQjtJQUFDLElBQUEsYUFBTSxHQUFFOzhCQUNFLEdBQUcsQ0FBQyxTQUFTO3FEQUFDO0FBTGhCLGtCQUFrQjtJQWhCOUIsSUFBQSxvQkFBYSxFQUFDO1FBQ1gsT0FBTyxFQUFFO1lBQ0wsR0FBRztZQUNILFFBQVE7WUFDUjtnQkFDSSxTQUFTLEVBQUUsSUFBSTtnQkFDZixrQkFBa0IsRUFBRSxDQUFDLE9BQU8sQ0FBQzthQUNoQztZQUNELElBQUk7WUFDSixVQUFVO1lBQ1YsS0FBSztZQUNMLEdBQUc7WUFDSCxVQUFVO1NBQ2I7UUFDRCxhQUFhLEVBQUUsQ0FBQyxJQUFBLFdBQUksRUFBQyxTQUFTLEVBQUUsVUFBVSxDQUFDLENBQUM7S0FDL0MsQ0FBQztHQUNXLGtCQUFrQixDQWdDOUI7QUFoQ1ksZ0RBQWtCIn0=