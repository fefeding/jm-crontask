import { Configuration, App, Inject } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as validate from '@midwayjs/validate';
import * as info from '@midwayjs/info';
import * as axios from '@midwayjs/axios';
import * as swagger from '@midwayjs/swagger';
//import * as orm from '@midwayjs/typeorm';
import { join } from 'path';
// import { DefaultErrorFilter } from './filter/default.filter';
// import { NotFoundFilter } from './filter/notfound.filter';
import { ReportMiddleware } from './middleware/report.middleware';
import { ApiResultFormatterMiddleware } from './middleware/apiResultFormatter';
import { RequestInitMiddleware } from './middleware/requestInit';
import * as view from '@midwayjs/view-nunjucks';
import * as staticFile from '@midwayjs/static-file';
import devopsConfig from './config/devops.config';
import { ApiGuard } from './guard/api';
import { AuthGuard } from './guard/auth';
// import * as core from '@jt/midway-core';
@Configuration({
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
        //orm,
        swagger,
    ],
    importConfigs: [join(__dirname, './config')],
})
export class ContainerLifeCycle {
    @App()
    app: koa.Application;

    @Inject()
    framework: koa.Framework;

    async onConfigLoad(container) {}

    async onReady() {
        // 接口守位
        this.app.useGuard([ApiGuard, AuthGuard]);

        // add middleware
        this.app.useMiddleware([
            RequestInitMiddleware,
            ReportMiddleware,
            ApiResultFormatterMiddleware,
        ]);
        // add filter
        // this.app.useFilter([NotFoundFilter, DefaultErrorFilter]);
    }

    async onServerReady() {
        if (process.env.NODE_ENV !== 'production') {
            console.log(
                `请访问 http://${process.env.IP || '127.0.0.1'}:${
                    process.env.PORT || 7001
                }${devopsConfig.prefixUrl}/`
            );
        }
    }
}
