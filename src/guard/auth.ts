import { Guard, IGuard, Inject } from '@midwayjs/core';
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

    async canActivate(
        context: Context,
        supplierClz,
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
        //console.log(context.cookies);
        
        let errRes = null;  
        try {
            let session = null;
            if (!token) {
                //context.status = 403;
                // 如果是从登陆回来，则验证监时码
                const authCode = context.URL.searchParams.get('auth_code'); 
                if(authCode) {
                    const res = await this.sessionService.loginByCode(authCode);
                    if(res.ret === 0) {
                        session = res.data;
                        // 登陆写入cookie
                        setAuthToken(context, session.id);
                        context.URL.searchParams.delete('auth_code');// 移除auth_code参数
                        context.URL.hostname = context.detect?.HOSTNAME || context.hostname;
                        const url = context.URL.toString();
                        context.redirect(url);
                        return true;
                    }
                }
                if(!session) {
                    errRes = {
                        ret: authRet,
                        msg: '需要登陆态',
                    };
                }
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

            // 登陆态挂载到当前上下文
            context.currentSession = session;

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
            context.redirect(`${devopsConfig.prefixUrl}/login`);
        }
    }
}
