import { Config, Guard, IGuard, Inject } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { SessionService } from '../service/session';
import { getCheckLogin } from '../lib/decorator';
import devopsConfig from '../config/devops.config';
import { getAuthToken, setAuthToken } from '../lib/utils';

// 校验api路径规则的
const apiReg = /^\/([^/]+\/)?api\//i;

/**
 * 校验请求的登陆态
 */
@Guard()
export class AuthGuard implements IGuard<Context> {
    @Inject()
    sessionService: SessionService;
    
    @Config('sso')
    ssoOption: any;

    async canActivate(
        context: Context,
        supplierClz: any,
        methodName: string
    ): Promise<boolean> {
        // 获取是否需要检查登陆态
        const needAuth = getCheckLogin(supplierClz, methodName);
        const token = getAuthToken(context);
        if(token) context.auth_token = token;
       
        const ret = await this.checkAuth(context, token, needAuth);
        return ret;
    }

    // 校验是否有带api token
    async checkAuth(context: Context, token: string, needAuth?: boolean) {
        this.sessionService.ctx = context;
        const authRet = 50001;
        console.log('check auth', token, needAuth);
        
        let errRes = null;  
        try {
            let session = null;
            // 如果是从登陆回来，则验证监时码
            const authCode = context.URL.searchParams.get('auth_code'); 
            if(authCode) {
                const res = await this.sessionService.loginByCode(authCode);
                if(res.ret === 0) {
                    session = res.data;
                    // 登陆写入cookie
                    setAuthToken(context, session.id);                    
                }
                context.URL.searchParams.delete('auth_code');// 移除auth_code参数
                context.URL.hostname = context.detect?.HOSTNAME || context.hostname;
                const url = context.URL.toString();
                context.redirect(url);
                return true;
            }
            
            if (token && !errRes && !session) {
                session = await this.sessionService.getLoginSession(token);
                if (!session || !session.id) {
                    setAuthToken(context, '');
                    //context.status = 403;
                    errRes = {
                        ret: authRet,
                        msg: 'token不存在或已过期',
                    };
                }
            }

            if(!session) {
                errRes = {
                    ret: authRet,
                    msg: '需要登陆态',
                };
            }

            // 登陆态挂载到当前上下文
            context.currentSession = session;

            // @ts-ignore 登陆态挂载到logger
            if(session && context.logger?.setOptions) {
                // @ts-ignore
                context.logger.setOptions({
                    loginId: session?.loginId || '',
                    userId: (session?.userId || '').toString(),
                });
            }

            if(errRes && needAuth) {
                this.authError(context, errRes);
            }
        }
        catch(e) {
            console.error(e);
            errRes = {
                ret: authRet,
                msg: e.message || 'auth error',
            };
            if(needAuth) this.authError(context, errRes);
        }
        return true;
    }

    // 异常处理
    authError(context: Context, error?: any) {
        if(apiReg.test(context.path)) {
            context.status = 200;
            context.res.write('', 'utf8');
            throw error;
        }
        else {
            const loginUrl = `${this.ssoOption?.baseUrl||devopsConfig.prefixUrl}/login`;
            
            // 如果本来就以/login结尾，则直跳
            if(!/\/login\/?(\?|$|#)/.test(context.URL.pathname)) {
                const URL = context.URL;
                if(context.detect?.HOSTNAME && URL.hostname !== context.detect?.HOSTNAME) URL.hostname = context.detect.HOSTNAME;
                URL.searchParams.delete('jv_auth_code');
                URL.searchParams.delete('token');
                URL.searchParams.delete('auth_code');// 移除auth_code参数
                const redirectUrl = context.URL.toString();

                context.redirect(`${loginUrl}?url=${encodeURIComponent(redirectUrl)}&appid=${this.ssoOption?.appId||0}`);
            }
            else {
                context.redirect(loginUrl);
            }
        }
    }
}
