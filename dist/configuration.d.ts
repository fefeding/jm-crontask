import * as koa from '@midwayjs/koa';
export declare class ContainerLifeCycle {
    app: koa.Application;
    framework: koa.Framework;
    onConfigLoad(container: any): Promise<void>;
    onReady(): Promise<void>;
    onServerReady(): Promise<void>;
}
