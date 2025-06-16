import { Guard, IGuard, Config } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { getApiToken, getCheckIP } from '../lib/decorator';
import api from '@fefeding/common/dist/utils/api';

/**
 * 对于需要token的接口，从query或body或cookie中取token，是否跟本服务的一致
 */
@Guard()
export class ApiGuard implements IGuard<Context> {
    // 登陆态验证配置
    @Config('apiOption')
    apiOption: {
        key: string;
    };

    @Config('ipOption')
    ipOption: {
        whiteList: Array<string>;
    };

    async canActivate(
        context: Context,
        supplierClz,
        methodName: string
    ): Promise<boolean> {
        // 检查是否有IP白名单限制
        const needIP = getCheckIP(supplierClz, methodName);
        if(needIP) {
            //console.log('check ip ', needIP);
            this.checkIPInWhiteList(context);
        }
        // 获取是否需要检查token
        const needToken = getApiToken(supplierClz, methodName);

        if (needToken) {
            await this.checkApiToken(context);
        }
        return true;
    }

    // 校验是否有带api token
    async checkApiToken(context: Context) {
        const body = (context.request.body || {}) as any;
        const reqToken =
            context.URL.searchParams.get('api_token') ||
            context.request.header['x-api-token'] ||
            body.api_token ||
            context.cookies.get('api_token');
        const timestamp = Number(
            context.URL.searchParams.get('timestamp') ||
            context.request.header['x-api-timestamp'] ||
                body.timestamp ||
                context.cookies.get('timestamp')
        );
        if (!reqToken || !timestamp) {
            context.logger.error(
                `token为空，非法请求, token: ${reqToken}, timestamp: ${timestamp}`
            );
            throw Error('token为空，非法请求');
        }

        //const time = new Date(timestamp);
        console.log('token time', reqToken, timestamp);
        // 如果超过一定时间，则失效
        if (timestamp < Date.now() - 5 * 60 * 1000) {
            throw Error('timestamp已超过有效时间');
        }

        const thisToken = api.createApiToken(this.apiOption.key, timestamp);

        if (reqToken !== thisToken.sign) {
            context.logger.error(
                `输入token:${reqToken}  本地: ${thisToken.sign} 不一致`
            );
            throw Error('token输入错误');
        }
    }

    // 检查IP白名单
    checkIPInWhiteList(context: Context) { 
        const requestIp = context.detect?.REQUESTIP;
        if(this.ipOption?.whiteList) {
            if(!this.ipOption.whiteList.includes(requestIp)) {
                context.logger.error(`IP:${requestIp} 不在白名单内`);
                throw Error(`IP:${requestIp} 不在白名单内`);
            }
        }
    }
}
