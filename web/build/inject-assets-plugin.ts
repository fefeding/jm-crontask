import type { PluginOption } from 'vite';

/**
 * Vite插件：动态加载静态入口文件，用于路径拼接
 * 将Vite注入的module script/link标签替换为自定义加载函数调用
 */
export function injectAssetsPlugin(urlPrefix: string): PluginOption {
    return {
        name: 'inject-assets',
        transformIndexHtml(html: string, ctx: any) {
            if (!ctx.chunk?.fileName || !html.includes('__vitejs_load_entry(')) {
                return html;
            }

            // 替换 <script type="module"> 标签
            html = html.replace(
                /<script\s*type="module"\s*[^\>]*\s*src="([^"]+)"\s*>\s*<\/script>/g,
                (match, src) => {
                    if (!src || /^(http(s)?:)?\/\//i.test(src)) return match;
                    if (src.startsWith(urlPrefix)) src = src.replace(urlPrefix, '');
                    return `<script>window.__vitejs_load_entry && window.__vitejs_load_entry('${src}', 'script');</script>`;
                }
            );

            // 替换 <link rel="modulepreload"> 标签
            html = html.replace(
                /<link\s*rel="modulepreload"\s*[^\>]*\s*href="([^"]+)"\s*\/?>/g,
                (match, href) => {
                    if (!href || /^(http(s)?:)?\/\//i.test(href)) return match;
                    if (href.startsWith(urlPrefix)) href = href.replace(urlPrefix, '');
                    return `<script>window.__vitejs_load_entry && window.__vitejs_load_entry('${href}', 'modulepreload');</script>`;
                }
            );

            // 替换 <link rel="stylesheet"> 标签
            html = html.replace(
                /<link\s*rel="stylesheet"\s*[^\>]*\s*href="([^"]+)"\s*\/?>/g,
                (match, href) => {
                    if (!href || /^(http(s)?:)?\/\//i.test(href)) return match;
                    if (href.startsWith(urlPrefix)) href = href.replace(urlPrefix, '');
                    return `<script>window.__vitejs_load_entry && window.__vitejs_load_entry('${href}', 'stylesheet');</script>`;
                }
            );

            // 替换 <link rel="icon"> 标签
            html = html.replace(
                /<link\s*rel="icon"\s*[^\>]*\s*href="([^"]+)"\s*\/?>/g,
                (match, href) => {
                    if (!href || /^(http(s)?:)?\/\//i.test(href)) return match;
                    if (href.startsWith(urlPrefix)) href = href.replace(urlPrefix, '');
                    return `<script>window.__vitejs_load_entry && window.__vitejs_load_entry('${href}', 'icon');</script>`;
                }
            );

            return html;
        },
    };
}
