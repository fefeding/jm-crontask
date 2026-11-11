/**
 * Tailwind CSS 配置
 *
 * 与 Bootstrap 共存：
 * - 关闭 preflight（基础样式交由 Bootstrap reboot 负责，避免两套 reset 互相覆盖）
 * - 主题色对齐 Bootstrap 语义色，使 bg-primary / text-success 等类名
 *   在两个库中取值一致，避免同名类互相打架
 */
const bootstrapColors = {
    primary: '#0d6efd',
    'primary-light': 'rgba(13, 110, 253, 0.15)',
    secondary: '#6c757d',
    success: '#198754',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#0dcaf0',
    light: '#f8f9fa',
    dark: '#212529',
};

/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
    corePlugins: {
        // 关闭 preflight：避免 Tailwind 的 reset 破坏 Bootstrap 组件样式
        preflight: false,
    },
    theme: {
        extend: {
            colors: bootstrapColors,
        },
    },
    plugins: [],
};
