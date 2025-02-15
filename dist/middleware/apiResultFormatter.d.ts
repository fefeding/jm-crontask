import { IMiddleware } from '@midwayjs/core';
import { NextFunction, Context } from '@midwayjs/koa';
export declare class ApiResultFormatterMiddleware implements IMiddleware<Context, NextFunction> {
    ignore(ctx: Context): boolean;
    resolve(): (ctx: Context, next: NextFunction) => Promise<void>;
}
