import { Controller, Get, Inject, Provide, Config } from '@midwayjs/core';
import { SessionService, decorators, utils, koa } from '@cicctencent/midwayjs-base';
import devopsConfig from '../config/devops.config';

@Provide()
@Controller('/')
export class HomeController {
    @Inject()
    ctx: koa.Context;

    @Inject()
    sessionService: SessionService;
    @Config('sso')
    ssoOption: any;

    @Get('/admin/login')
    @Get('/admin/logout')
    @decorators.checkLogin(false)
    async login(): Promise<string> {
        console.log('login render', this.ctx.path, this.ctx.auth_token);
        if(this.ctx.auth_token && this.ctx.path.includes('/logout')) {
            const res = await this.sessionService.logout(this.ctx.auth_token);
            console.log('logout', res);
            if(res.ret === 0) {
                this.ctx.cookies.set('token', '');
            }
        }
        return utils.getDefaultTemplate(this.ctx, 'admin.html');
    }

    @Get('/*')
    @Get('/')
    @decorators.checkLogin(false)// 需要登陆态的接口
    async admin(): Promise<string> {
        return utils.getDefaultTemplate(this.ctx, 'admin.html', {
            sso: this.ssoOption,
      	    title: process.env.TITLE || '系统',
        });
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
    getDefaultTemplate(file='index.html') {    
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
                session: this.ctx.currentSession||null,
                isManager: this.sessionService.checkManager(),
                jvCommon: config?.jvCommon,
                title: devopsConfig.siteTitle,
            },
            title: devopsConfig.siteTitle,
            env: process.env,
            viteTarget: viteTarget ? `//${this.ctx.hostname}:${viteTarget}` : '',
        };
        //console.log(file, data);
        return this.ctx.render(file, data);
    }
}

