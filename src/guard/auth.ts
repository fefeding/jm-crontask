import { Guard, IGuard, Inject } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { SessionService } from '../service/session';
import { getCheckLogin } from '../lib/decorator';
import devopsConfig from '../config/devops.config';

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
        const body = (context.request.body || {}) as any;
        const token =
            context.URL.searchParams.get('token') ||
            context.request.header['x-auth-token'] ||
            body.token ||
            context.cookies.get('token', {
                signed: false,
            });
        if(token) context.auth_token = token;
        console.log(needAuth, token);
        if (needAuth) {
            const ret = await this.checkAuth(context, token);
            return ret;
        }
        return true;
    }

    // 校验是否有带api token
    async checkAuth(context: Context, token: string) {
        this.sessionService.ctx = context;
        const authRet = 50001;
        //console.log(context.cookies);
        
        let errRes = null;
        if (!token) {
            //context.status = 403;
            errRes = {
                ret: authRet,
                msg: '需要登陆态',
            };
        }

        let session = null;
        if (token && !errRes) {
            session = await this.sessionService.getLoginSession(token);
            if (!session) {
                //context.status = 403;
                errRes = {
                    ret: authRet,
                    msg: 'token不存在或已过期',
                };
            }
            else {                
                // 登陆态挂载到当前上下文
                context.currentSession = session;
                //console.log(session);
            }
        }

        if(errRes) {
            console.log(errRes, context.path);
            if(apiReg.test(context.path)) {
                context.status = 200;
                context.res.write('', 'utf8');
                throw errRes;
            }
            else {
                context.redirect(`${devopsConfig.prefixUrl}/admin/login`);
            }
        }
        return true;
    }
}
