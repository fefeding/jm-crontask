import { Inject, Controller, All, Provide, Body, Config } from '@midwayjs/core';
import { BaseController } from '../base/base.controller';
import { SessionService } from '../service/session';
//import { checkApiToken } from '../lib/decorator';

@Provide()
@Controller('/api/session')
export class SessionController extends BaseController {
    @Inject()
    sessionService: SessionService;
    // 登陆态验证配置
    @Config('defaultPage')
    defaultPage: string;

    // 接口需要验证token
    @All('/loginByWx')
    async loginByWx(@Body() loginParams: any) {
        
        const res = await this.sessionService.loginByWx(loginParams);
        if(res.ret === 0 && res.data) {
            this.ctx.cookies.set('token', res.data.id);// 写入cookie
            return {
                ...res.data,                
                defaultPage: this.defaultPage,
            }
        }
        return res;
    }

    // 接口需要验证token
    @All('/loginByAccount')
    async loginByAccount(@Body() loginParams: any) {
        const res = await this.sessionService.loginByAccount(loginParams);
        if(res.ret === 0 && res.data) {
            this.ctx.cookies.set('token', res.data.id);// 写入cookie
            return {
                ...res.data,                
                defaultPage: this.defaultPage,
            }
        }
        return res;
    }
}
