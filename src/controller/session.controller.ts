import { Inject, Controller, All, Provide, Body, } from '@midwayjs/core';
import { BaseController, utils } from '@cicctencent/midwayjs-base';
import { SessionService } from '../service/session.service';
import { UserService } from '../service/user.service';
//import { checkApiToken } from '../lib/decorator';

@Provide()
@Controller('/api/session')
export class SessionController extends BaseController {
    @Inject()
    sessionService: SessionService;

    @Inject()
    userService: UserService;

    // 接口需要验证token
    @All('/loginByWx')
    async loginByWx(@Body() loginParams: any) {
        
        const res = await this.sessionService.loginByWx(loginParams);
        if(res.ret === 0 && res.data) {
            utils.setAuthToken(this.ctx, res.data.id);// 写入cookie
            return {
                ...res.data,  
            }
        }
        return res;
    }

    // 登出
    @All('/logout')
    async logout() {
        const token = utils.getAuthToken(this.ctx);
        utils.setAuthToken(this.ctx, '');   
        if(!token) return '';
           
        if(this.sessionService.baseServiceOption.url) {
            const res = await this.sessionService.logout(token);
            if(res.ret === 0 && res.data) {
                return {
                    ...res.data,  
                }
            }
            return res;
        }
    }

    // 接口需要验证token
    @All('/loginByAccount')
    async loginByAccount(@Body() loginParams: any) {
        // 没有配置服务端，则本地验证
        if(!this.sessionService.baseServiceOption.url) {
            const user = await this.userService.verifyAccount(loginParams.account, loginParams.password);
            if(user) {
                const timeout = this.sessionService.sessionOption?.timeout || 20*60*1000;
                 
                const session = {
                    lastDate: (new Date()).setMilliseconds(Date.now() + timeout),
                    id: Math.floor(Math.random() * 100000).toString(),
                    loginId: user.account,
                    user: {
                        id: user.id,
                        name: user.name,
                        avatar: user.avatar,                        
                    },
                    account: {
                        loginId: user.account,
                        account: user.account,                        
                    },                    
                    userId: user.id,
                }
                const token = 'Bearer ' + utils.encodeJWT(session, this.sessionService.sessionOption?.secretKey || 'fefeding');
                
                utils.setAuthToken(this.ctx, token);// 写入cookie
                return token;
            }
            else {
                throw Error('登陆失败, 请确保用户名或密码正确');
            }
        }
        else {
            const res = await this.sessionService.loginByAccount(loginParams);
            if(res.ret === 0 && res.data) {
                utils.setAuthToken(this.ctx, res.data.id);// 写入cookie
                return res.data;
            }
            return res;
        }
    }
}
