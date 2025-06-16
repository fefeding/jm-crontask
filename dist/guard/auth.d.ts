import { IGuard } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { SessionService } from '../service/session';
/**
 * 校验请求的登陆态
 */
export declare class AuthGuard implements IGuard<Context> {
    sessionService: SessionService;
    canActivate(context: Context, supplierClz: any, methodName: string): Promise<boolean>;
    checkAuth(context: Context, token: string, needAuth?: boolean): Promise<boolean>;
    authError(context: Context, error?: any): void;
}
