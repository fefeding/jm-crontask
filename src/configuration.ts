import { Configuration, App, Inject } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as validate from '@midwayjs/validate';
import * as info from '@midwayjs/info';
import * as axios from '@midwayjs/axios';
import * as dotenv from 'dotenv';
//import * as swagger from '@midwayjs/swagger';
import * as orm from '@midwayjs/typeorm';
import { join } from 'path';
// import { DefaultErrorFilter } from './filter/default.filter';
import { NotFoundFilter } from './filter/notfound.filter';
import { ApiResultFormatterMiddleware } from './middleware/apiResultFormatter';
import { RequestInitMiddleware } from './middleware/requestInit';
import { DetectMiddleware } from './middleware/detect.middleware';
import { PinoLoggerMiddleware } from './middleware/pino.middleware';
import * as view from '@midwayjs/view-nunjucks';
import * as staticFile from '@midwayjs/static-file';
import * as cacheManager from '@midwayjs/cache-manager';
import devopsConfig from './config/devops.config';
import { ApiGuard } from './guard/api';
import { AuthGuard } from './guard/auth';
// import * as core from '@jt/midway-core';

// load .env file in process.cwd
dotenv.config();

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
        orm,
        cacheManager,
        //swagger,
    ],
    importConfigs: [join(__dirname, './config')],
})
export class ContainerLifeCycle {
    @App()
    app: koa.Application;

    @Inject()
    framework: koa.Framework;

    async onConfigLoad(container) {
        
    }

    async onReady() {
        process.env.SERVICE_NAME = process.env.SERVICE_NAME || this.app.getProjectName();
        // 接口守位
        this.app.useGuard([
            ApiGuard, 
            AuthGuard
        ]);

        // add middleware
        this.app.useMiddleware([
            RequestInitMiddleware,  
            DetectMiddleware,  
            PinoLoggerMiddleware,        
            ApiResultFormatterMiddleware,
        ]);
        // add filter
        this.app.useFilter([NotFoundFilter]);
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
