import { Middleware, IMiddleware } from '@midwayjs/core';
import { NextFunction, Context } from '@midwayjs/koa';
import { v4 as UUID } from 'uuid';

@Middleware()
export class RequestInitMiddleware implements IMiddleware<Context, NextFunction> {
    resolve() {
        return async (ctx: Context, next: NextFunction) => {
            const body = (ctx.request.body || {}) as any;
            let request_id = ctx.URL.searchParams.get('request_id') || body.request_id ||
                ctx.request.header['x-request-id'] ||
                ctx.cookies.get('request_id', {
                        signed: false,
                    });
            
            if (!request_id) request_id = UUID().replace(/-/g, '');

            ctx.request_id = request_id;
            console.log('request start', request_id);
            return next();
        };
    }
}
