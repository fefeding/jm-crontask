import { Inject, Controller, All, Provide, Body, } from '@midwayjs/core';
import { BaseController, utils } from '@cicctencent/midwayjs-base';
import { SessionService, LOCAL_SESSION_SECRET_KEY } from '../service/session.service';
import { UserService } from '../service/user.service';
import { BizError } from '../errors/BizError';
import { RET_BIZ_ERROR } from '../errors/retCode';
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
                // 签名密钥必须与校验端一致（session.secretKey），
                // 否则 AuthGuard 校验 Bearer Token 时会判定失败
                const token = 'Bearer ' + utils.encodeJWT(session, this.sessionService.sessionOption?.secretKey || LOCAL_SESSION_SECRET_KEY);
                
                utils.setAuthToken(this.ctx, token);// 写入cookie
                return token;
            }
            else {
                // 用 BizError 抛出：msg 会原样返回给前端提示用户。
                // 普通 Error 会被统一转成「系统错误」(ret:1001)，用户看不到原因。
                throw new BizError('用户名或密码错误');
            }
        }
        else {
            let res: any;
            try {
                res = await this.sessionService.loginByAccount(loginParams);
            }
            catch(err: any) {
                // 账号服务不可用（连接被拒、超时等）：转成可读的业务错误，
                // 避免前端只拿到「系统错误」而无法提示用户。
                this.ctx.logger?.error('[loginByAccount] 转发账号服务失败', {
                    baseServerUrl: this.sessionService.baseServiceOption?.url,
                    message: err?.message,
                });
                throw new BizError('账号服务不可用, 请稍后重试或联系管理员');
            }
            if(res?.ret === 0 && res.data) {
                utils.setAuthToken(this.ctx, res.data.id);// 写入cookie
                return res.data;
            }
            // 账号服务返回业务失败（如账号或密码错误），透传其错误码与信息
            return res || { ret: RET_BIZ_ERROR, msg: '登录失败, 请稍后重试' };
        }
    }
}
