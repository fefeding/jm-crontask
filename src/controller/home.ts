import { Controller, Get, Inject, Provide } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { SessionService } from '../service/session';
import devopsConfig from '../config/devops.config';
import { checkLogin } from '../lib/decorator';

@Provide()
@Controller('/')
export class HomeController {
    @Inject()
    ctx: Context;

    @Inject()
    sessionService: SessionService;

    @Get('/admin/login')
    @Get('/admin/logout')
    @checkLogin(false)
    async login(): Promise<string> {
        console.log('login render', this.ctx.path, this.ctx.auth_token);
        if(this.ctx.auth_token && this.ctx.path.includes('/logout')) {
            const res = await this.sessionService.logout(this.ctx.auth_token);
            console.log('logout', res);
            if(res.ret === 0) {
                this.ctx.cookies.set('token', '');
            }
        }
        return this.getDefaultTemplate('admin.html');
    }

    @Get('/admin/*')
    @checkLogin(true)// 需要登陆态的接口
    async admin(): Promise<string> {
        return this.getDefaultTemplate('admin.html');
    }

    @Get('/*')
    async home(): Promise<string> {
        return this.getDefaultTemplate('index.html');
    }

    @Get('/')
    async defaultToHome() {
        return this.getDefaultTemplate('index.html');
    }

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

