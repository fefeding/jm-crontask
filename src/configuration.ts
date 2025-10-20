import { Configuration, App } from '@midwayjs/core';
import * as busboy from '@midwayjs/busboy';
import * as codeDye from '@midwayjs/code-dye';

//import * as swagger from '@midwayjs/swagger';
import * as orm from '@midwayjs/typeorm';
import { join } from 'path';
// import { DefaultErrorFilter } from './filter/default.filter';
import { NotFoundFilter } from './filter/notfound.filter';
// import * as view from '@midwayjs/view-nunjucks';
// import * as staticFile from '@midwayjs/static-file';
import * as cacheManager from '@midwayjs/cache-manager';
import devopsConfig from './config/devops.config';

import * as baseMidwayjs from '@cicctencent/midwayjs-base';

@Configuration({
    imports: [
        {
            component: codeDye,
            enabledEnvironment: ['local'],    // 只在本地启用
        },
        busboy,
        orm,
        cacheManager,
        baseMidwayjs,
    ],
    importConfigs: [join(__dirname, './config')],
})
export class ContainerLifeCycle {
    @App()
    app: baseMidwayjs.koa.Application;

    async onConfigLoad(container) {
        
    }

    async onReady() {
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
