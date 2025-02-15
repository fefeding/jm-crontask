import { IGuard } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
/**
 * 对于需要token的接口，从query或body或cookie中取token，是否跟本服务的一致
 */
export declare class ApiGuard implements IGuard<Context> {
    apiOption: {
        key: string;
    };
    canActivate(context: Context, supplierClz: any, methodName: string): Promise<boolean>;
    checkApiToken(context: Context): Promise<void>;
}
