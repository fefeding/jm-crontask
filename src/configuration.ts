/**
 * @file 应用入口配置
 * @description Midway.js 应用生命周期管理，负责加载组件、配置和过滤器
 * @author fefeding
 */
import { Configuration, App } from '@midwayjs/core';
import * as busboy from '@midwayjs/busboy';
import * as codeDye from '@midwayjs/code-dye';
import * as validate from '@midwayjs/validate';
import * as swagger from '@midwayjs/swagger';
import * as orm from '@midwayjs/typeorm';
import { join } from 'path';
import { DefaultErrorFilter } from './filter/default.filter';
import { NotFoundFilter } from './filter/notfound.filter';
import { ChromeDevtoolsMiddleware } from './middleware/devtools.middleware';
import * as staticFile from '@midwayjs/static-file';
import * as cacheManager from '@midwayjs/cache-manager';
import devopsConfig from './config/devops.config';
import { userSeedInitializer } from './initializers/user-seed.initializer';

import * as baseMidwayjs from '@cicctencent/midwayjs-base';
//import * as baseServerMidwayjs from '@cicctencent/base-server';

/**
 * 动态加载的组件列表
 * - codeDye: 代码染色调试工具，仅本地环境启用
 * - busboy: 文件上传处理
 * - validate: 参数校验（src/dto/*.ts 上的 @Rule 依赖它，务必保留）
 * - swagger: 接口文档（访问 {prefixUrl}/swagger-ui/index.html）
 * - staticFile: 静态资源服务
 * - cacheManager: 缓存
 * - baseMidwayjs: 公司内部基础组件（Session、认证等）
 * - orm: TypeORM 数据库组件
 */
const imports: any[] = [
    {
        component: codeDye,
        enabledEnvironment: ['local'], // 只在本地启用
    },
    busboy,
    validate,
    swagger,
    staticFile,
    cacheManager,
    baseMidwayjs,
    orm,
];

/**
 * 可选组件（默认不启用，需要时取消注释并加入上面的 imports 数组）
 *
 * - viewNunjucks（@midwayjs/view-nunjucks）：服务端模板渲染。
 *   **本项目不需要**：页面 HTML 由前端构建期的 @fefeding/vite-nunjucks-plugin
 *   预渲染为静态文件，后台只负责注入 __INITIAL_STATE__
 *   （见 utils.getDefaultTemplate），不做服务端模板渲染。
 * - baseServerMidwayjs（@cicctencent/base-server）：接入公司统一账号服务时启用，
 *   启用后本地登录路径（session.controller 的 loginByAccount）会改为转发远程。
 *
 * 这些包的依赖仍保留在 package.json 中（取消注释即可用）；
 * 若要彻底移除，需同步更新 pnpm-lock.yaml。
 */
// import * as viewNunjucks from '@midwayjs/view-nunjucks';
// import * as baseServerMidwayjs from '@cicctencent/base-server';

/**
 * Midway 应用配置
 * - imports: 加载的组件列表
 * - importConfigs: 配置文件目录
 * - detectorOptions.ignore: 忽略检测的目录
 */
@Configuration({
    imports,
    importConfigs: [join(__dirname, './config')],
    detectorOptions: {
        ignore: ['**/web/**', '**/dist/web/**'],
    },
})
export class ContainerLifeCycle {
    /** 应用实例 */
    @App()
    app: baseMidwayjs.koa.Application = null as any;

    /**
     * 应用就绪回调
     * 注册全局异常过滤器
     */
    async onReady() {
        // 注册异常过滤器：DefaultErrorFilter 处理所有异常，NotFoundFilter 处理 404
        this.app.useFilter([DefaultErrorFilter, NotFoundFilter]);
        // 注册全局中间件：过滤 Chrome 自动请求的 devtools.json 噪声请求
        this.app.useMiddleware([ChromeDevtoolsMiddleware]);

        // 管理员账号播种（幂等，按 baseService.manager 创建本地用户）
        try {
            await userSeedInitializer.init(this.app.getApplicationContext());
        } catch (e: any) {
            // 启动期日志：此时还没有请求上下文，用 console 输出
            console.warn('[Configuration] UserSeed 初始化失败:', e?.message);
        }
    }

    /**
     * 服务器启动完成回调
     * 打印访问地址
     */
    async onServerReady() {
        if (process.env.NODE_ENV !== 'production') {
            console.log(
                `请访问 http://${process.env.IP || '127.0.0.1'}:${
                    process.env.PORT || 8000
                }${devopsConfig.prefixUrl}/`
            );
        }
    }
}
