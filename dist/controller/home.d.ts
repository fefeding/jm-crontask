import { Context } from '@midwayjs/koa';
import { SessionService } from '../service/session';
export declare class HomeController {
    ctx: Context;
    sessionService: SessionService;
    login(): Promise<string>;
    admin(): Promise<string>;
    /**
     * render模板
     * @param ctx
     * @param file
     * @returns
     */
    getDefaultTemplate(file?: string): Promise<string>;
}
