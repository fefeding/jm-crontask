/**
 * @file Chrome DevTools 噪声请求过滤中间件
 * @description Chrome 浏览器会自动请求 /.well-known/appspecific/com.chrome.devtools.json，
 *              该路径无对应路由会抛 NotFoundError，并被基础组件的 RequestInitMiddleware
 *              记录为 "Request failed" 错误日志。此中间件在请求到达下游前短路该路径，
 *              避免无意义的错误日志（不影响业务运行）。
 *
 *              处理策略：
 *              - 开发环境：返回合法 JSON（roots 指向项目根目录），满足 Chrome DevTools
 *                的「自动工作区映射」功能，方便本地调试直接改文件。
 *              - 生产环境：返回空响应（204），不暴露服务器文件系统路径。
 * @author fefeding
 */
import { Middleware } from '@midwayjs/core';
import { koa } from '@cicctencent/midwayjs-base';

/** Chrome 自动请求的路径，无需业务处理 */
const CHROME_DEVTOOLS_PATH =
    '/.well-known/appspecific/com.chrome.devtools.json';

/** 将项目根目录转换为 file:// URL（兼容 Windows / Linux 路径） */
function getDevtoolsRoots(): string[] {
    const cwd = process.cwd().replace(/\\/g, '/');
    const root = cwd.startsWith('/') ? `file://${cwd}` : `file:///${cwd}`;
    return [root];
}

@Middleware()
export class ChromeDevtoolsMiddleware {
    resolve() {
        return async (ctx: koa.Context, next: () => Promise<void>) => {
            if (ctx.path !== CHROME_DEVTOOLS_PATH) {
                await next();
                return;
            }
            // 短路，不调用 next()，避免触发下游 NotFoundError 与错误日志
            if (process.env.NODE_ENV !== 'production') {
                ctx.status = 200;
                ctx.type = 'application/json';
                ctx.body = JSON.stringify({
                    version: 1,
                    roots: getDevtoolsRoots(),
                });
            } else {
                ctx.status = 204;
                ctx.body = '';
            }
        };
    }
}
