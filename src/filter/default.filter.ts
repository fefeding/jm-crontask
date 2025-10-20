import { Catch } from '@midwayjs/core';
import { koa } from '@cicctencent/midwayjs-base';

@Catch()
export class DefaultErrorFilter {
    async catch(err: Error, ctx: koa.Context) {
        // 所有的未分类错误会到这里
        return {
            ret: 1000,
            msg: err.message,
        };
    }
}
