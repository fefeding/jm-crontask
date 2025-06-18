import { Middleware, IMiddleware } from '@midwayjs/core';
import { NextFunction, Context } from '@midwayjs/koa';

@Middleware()
export class DetectMiddleware implements IMiddleware<Context, NextFunction> {
    resolve() {
        return async (ctx: Context, next: NextFunction) => {
            const UA = ctx.get('user-agent') || '';
            const IS_MOBILE = /Mobile/i.test(UA); 
            const VER_MQQ = UA.match(/QQ\/([\d.]+)/i) && UA.match(/QQ\/([\d.]+)/i)?.[1];
            const IS_MQQ = Boolean(VER_MQQ);
            // 微信版本号可能分4段，影响业务代码里使用semver比较版本号（会报错），如果业务需要4段版本号可以自己从ua里取
            const VER_WEIXIN =
                UA.match(/MicroMessenger\/([\d.]+)/i) &&
                UA.match(/MicroMessenger\/([\d.]+)/i)?.[1]
                    .split('.')
                    .slice(0, 3)
                    .join('.');
            const IS_WEIXIN = Boolean(VER_WEIXIN);

            // 是否是开发者工具
            const IS_WECHATTOOLS = /wechatdevtools\//i.test(UA);
            // @ts-ignore
            const IS_PCWEIXIN = /(Windows|Mac)Wechat/i.test(UA);
            // 是否是企业微信
            const IS_WXWORK = /wxwork\//i.test(UA);
            // @ts-ignore
            const VER_MINA = /miniProgram/i.test(UA);
            const IS_MINA = Boolean(VER_MINA);

            let requestIP = (ctx.request.header['x-forwarded-for'] ||
            ctx.request.ip || '').toString();
            if(requestIP.includes(',')) requestIP = requestIP.split(',')[0];
            
            const clientIP = (ctx.request.header['x-client-ip'] || requestIP).toString();
            
            const hostname = ctx.get('tencent-acceleration-domain-name') || ctx.request.hostname;

            // 环境变量
            ctx.detect = {
                IS_MOBILE,
                IS_MQQ,
                IS_WEIXIN,
                IS_WECHATTOOLS,
                IS_PCWEIXIN,
                IS_WXWORK,
                IS_MINA,
                CLIENTIP: clientIP,
                REQUESTIP: requestIP,
                HOSTNAME: hostname,
            }
            return next();
        };
    }
}
