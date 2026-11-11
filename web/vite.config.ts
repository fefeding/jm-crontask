/**
 * @file Vite 构建配置
 * @description Vue3 前端项目构建配置
 * @author fefeding
 *
 * 主要功能：
 * 1. Vue3 + JSX 支持
 * 2. Nunjucks 模板渲染
 * 3. 代码分割优化（vue / lodash / bootstrap 独立 chunk）
 * 4. 多入口 HTML 构建
 * 5. 环境变量注入
 */
import { fileURLToPath, URL } from 'node:url';

import { defineConfig, type PluginOption } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import CopyPlugin from 'vite-plugin-files-copy';
import ViteNunjucksPlugin from '@fefeding/vite-nunjucks-plugin';
import { injectAssetsPlugin } from './build/inject-assets-plugin';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

// 加载根目录 .env 文件
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, encoding: 'utf-8' });
}

/** URL 前缀（用于部署到子路径） */
const urlPrefix = process.env.PREFIX ? `/${process.env.PREFIX}` : '/';

/** Vite 默认端口（与 .env 的 VITE_PORT 保持一致，缺省兜底用） */
const DEFAULT_VITE_PORT = 5173;

/**
 * 开发环境后端地址
 * 未显式配置 API_URL 时，默认转发到本地后端（端口与 .env 的 PORT 保持一致）
 */
const devApiTarget =
    process.env.API_URL || `http://127.0.0.1:${process.env.PORT || 8000}`;

/**
 * 代理前缀：始终只代理 API 路径（如 /api 或 /my-project/api）。
 *
 * 不能退化为 urlPrefix 本身——那会让 proxy 接管 base 下的所有前端资源
 * （源码 /src、SFC 样式子请求 /x.vue?vue&type=style...、HMR、依赖等），
 * 这些请求一旦经过 proxy 就会丢失 query string，被 Vite 当成主模块返回，
 * 导致所有 <style scoped> 失效（页面上看不到任何组件样式）。
 */
const devProxyPrefix = `${urlPrefix}/api`;

/** 默认初始状态（注入到页面模板） */
const defaultInitState = {
    "config": { "prefix": urlPrefix, "apiUrl": process.env.API_URL || "" },
    "sso": { "baseUrl": process.env.SSO_URL || '', "appId": process.env.APP_ID || 2 },
    "title": process.env.TITLE
};

/** 视图模板目录 */
const viewDir = path.resolve(__dirname, './view');

// Vite 配置
const config = defineConfig({
    plugins: [
        vue() as PluginOption,
        vueJsx() as PluginOption,
        // @ts-ignore
        CopyPlugin({
            patterns: [
                {
                    from: './public',
                    to: path.resolve(__dirname, './dist/public')
                },
            ]
        }),
        ViteNunjucksPlugin({
            variables: {
                prefix: '', // 构建时，去掉这种prefix前缀，vite会处理依赖关系
                viteTarget: '', // 构建之后的不加base
                __DEFAULTINITIAL_STATE__: JSON.stringify(defaultInitState),
            }
        }),
        injectAssetsPlugin(urlPrefix),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
            '#': fileURLToPath(new URL('../', import.meta.url)),
        },
    },
    build: {
        assetsDir: 'public',
        outDir: 'dist',
        manifest: true, // 关键！生成 manifest.json
        modulePreload: true,
        rollupOptions: {
            input: getViewInputs(viewDir),
            output: {
                // 按依赖拆包：框架/大依赖单独成 chunk，便于浏览器缓存。
                // 新增大型依赖（如 echarts）时在此追加一条分包规则。
                manualChunks(id) {
                    const ms = Array.from(id.matchAll(/\/node_modules\/([^\/]+)\//ig));
                    if (ms && ms.length) {
                        const m = ms[ms.length - 1];
                        if (m && m[1]) {
                            if (m[1].includes('@vue') || m[1].includes('vue-') || m[1] == 'vue') return 'vue';
                            if (m[1].includes('element-plus')) return 'element-plus';
                            if (m[1].includes('lodash')) return 'lodash';
                            if (m[1].includes('bootstrap')) return 'bootstrap';
                            if (m[1].includes('echarts')) return 'echarts';
                        }
                    }
                }
            }
        },
    },
    base: urlPrefix,
    server: {
        host: '0.0.0.0',
        port: Number(process.env.VITE_PORT) || DEFAULT_VITE_PORT,
        // 必须开启：否则端口被占用时 Vite 会静默递增到下一个可用端口，
        // 而后端渲染的 <base href="//<hostname>:{VITE_PORT}"> 仍指向原端口，
        // 两者不一致导致模块 404 白屏，且没有任何提示。
        // 开启后端口冲突直接启动失败，由 bin/dev.js 顺延或手工改 .env 的 VITE_PORT。
        strictPort: true,
        cors: true,
        // 开发环境把接口请求转发到后端，解决前后端分离端口不一致导致的跨域/404
        // 注意：必须 bypass 掉 Vite 自己要处理的前端资源（源码 /src、视图 /view、
        // HMR /@vite、依赖 /node_modules 等），否则这些请求也会被转发到后端，
        // 后端无对应路由会兜底返回 index.html，导致前端白屏。
        proxy: {
            [devProxyPrefix]: {
                target: devApiTarget,
                changeOrigin: true,
                bypass(req) {
                    const raw = req.url || '';
                    const p = raw.split('?')[0] || '';
                    if (
                        p.startsWith(`${urlPrefix}/src`) ||
                        p.startsWith(`${urlPrefix}/view`) ||
                        p.startsWith(`${urlPrefix}/@`) ||
                        p.startsWith(`${urlPrefix}/node_modules`) ||
                        p.startsWith(`${urlPrefix}/assets`) ||
                        p.includes('/@vite') ||
                        p.includes('/@fs') ||
                        p.includes('/@id')
                    ) {
                        // 必须原样返回 req.url（保留 query string）。
                        // bypass 返回的字符串会直接覆盖 req.url；若只返回路径（丢掉 query），
                        // SFC 的样式子请求 ?vue&type=style&index=0&scoped=xxx&lang.scss
                        // 会被 Vite 当成主模块请求返回，导致所有 <style scoped> 全部失效。
                        return raw;
                    }
                    return undefined; // 其余（/api、/swagger-ui、/public 等）转发后端
                },
            },
        },
    },
});
export default config;

/**
 * 获取指定目录下的所有.html文件，并返回一个对象，该对象将每个文件名（不带.html扩展名）映射到其完整路径。
 * @param dir 指定的目录
 * @returns 返回文件名到路径的映射对象
 */
function getViewInputs(dir: string): { [key: string]: string } {
    const entries = fs.readdirSync(dir);
    const htmlFiles = entries.filter(filename => filename.endsWith('.html'));
    const inputObj: { [key: string]: string } = {};

    for (const file of htmlFiles) {
        const name = path.basename(file, '.html'); // 获取文件名，不包括扩展名
        inputObj[name] = path.resolve(dir, file);
    }

    // input: {
    //   index: resolve(__dirname, "./view/index.html"),
    //   mobile: resolve(__dirname, "./view/mobile.html"),
    // }
    return inputObj;
  }
