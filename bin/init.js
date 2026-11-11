#!/usr/bin/env node

/**
 * @file 依赖初始化脚本
 * @description 跨平台（Windows / macOS / Linux）安装前后端依赖
 *
 * 优先使用 pnpm，未安装时回退 npm。
 */

const { execSync } = require('child_process');

// 检测系统中是否存在 pnpm
function detectPackageManager() {
    try {
        execSync('pnpm --version', { stdio: 'ignore' });
        return 'pnpm';
    } catch {
        return 'npm';
    }
}

// 主函数
function main() {
    const pm = detectPackageManager();

    console.log('📦 使用 ' + pm + ' 安装依赖...');

    try {
        // 安装前端依赖
        console.log('🌐 安装前端依赖...');
        execSync('cd web && ' + pm + ' install', { stdio: 'inherit' });

        // 安装后端依赖
        console.log('⚙️  安装后端依赖...');
        execSync(pm + ' install', { stdio: 'inherit' });

        console.log('✅ 依赖安装完成！');
    } catch (error) {
        console.error('❌ 安装失败:', error.message);
        process.exit(1);
    }
}

main();
