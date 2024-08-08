import { Inject, Controller, Provide } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

@Provide()
@Controller('/api')
export class APIController {
    @Inject()
    ctx: Context;
}
