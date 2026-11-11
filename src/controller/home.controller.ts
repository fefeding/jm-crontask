import { Controller, Get, Inject, Provide, Config } from '@midwayjs/core';
import { SessionService, decorators, utils, koa } from '@cicctencent/midwayjs-base';

@Provide()
@Controller('/')
export class HomeController {
    @Inject()
    ctx: koa.Context;

    @Inject()
    sessionService: SessionService;
    @Config('sso')
    ssoOption: any;

    @Get('/login')
    @Get('/admin/login')
    @Get('/logout')
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
    @decorators.checkLogin(true)// 需要登陆态的接口
    async admin(): Promise<string> {
        return utils.getDefaultTemplate(this.ctx, 'admin.html', {
            sso: this.ssoOption,
      	    title: process.env.TITLE || '系统',
        });
    }
}

