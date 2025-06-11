
import { Context } from '@midwayjs/koa';
import devopsConfig from '../config/devops.config';

//判断url是否是对应的域名
export function checkUrlHost(url: string, host: string|Array<string>) {
    if(/^\/[^\/]{1,}/.test(url)) return true;
    if(Array.isArray(host)) {
        for(const h of host) {
            if(checkUrlHost(url, h)) return true;
        }
        return false;
    }
    const reg = new RegExp('^(http(s)?:)?//' + host);
    return reg.test(url);
}

/**
     * render模板
     * @param ctx 
     * @param file 
     * @returns 
     */
export function getDefaultTemplate(ctx: Context, file='index.html', data: any = {}) {    
    // 前端端口，如果为空，说明就是开发环境了
    const viteTarget = process.env.VITE_PORT;
    const config = ctx.app.getConfig();
    const prefix = config.koa.globalPrefix;
    const option = {
        data: {
            config: {
                prefix,
            },
            session: ctx.currentSession||null,
            title: devopsConfig.siteTitle,
            ...data
        },
        title: devopsConfig.siteTitle,
        env: process.env,
        viteTarget: viteTarget ? `//${ctx.hostname}:${viteTarget}` : '',
    };
    //console.log(file, data);
    return ctx.render(file, option);
}

// 从当前请求中获取登陆态token
export function getAuthToken(ctx: Context) {
    const body = (ctx.request.body || {}) as any;
        const token =
        ctx.URL.searchParams.get('token') ||
        ctx.request.header['x-auth-token'] ||
            body.token ||
            ctx.cookies.get('token', {
                signed: false,
            });
    return token;
}

// 种登陆态token
export function setAuthToken(ctx: Context, token: string) {
    ctx.cookies.set('token', token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 30,
    });
}