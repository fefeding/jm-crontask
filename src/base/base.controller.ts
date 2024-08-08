import { App, Inject } from '@midwayjs/core';
import { Application, Context } from '@midwayjs/koa';

export abstract class BaseController {
    @App()
    protected app: Application;

    @Inject()
    protected ctx: Context;
}
