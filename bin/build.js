#!/usr/bin/env node

/**
 * @file 生产构建脚本
 * @description 跨平台（Windows / macOS / Linux）构建前后端产物
 *
 * 流程：
 * 1. 清空 web/dist
 * 2. 构建前端（vite build）
 * 3. 清空 dist
 * 4. 构建后端（midway-bin build）
 * 5. 把 web/dist 下所有文件复制到 dist/web
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const useShell = process.platform === 'win32';

/**
 * 执行命令，失败即终止构建
 */
function run(command, args) {
    console.log(`> ${command} ${args.join(' ')}`);
    const res = spawnSync(command, args, {
        stdio: 'inherit',
        shell: useShell,
        cwd: rootDir,
    });
    if (res.error) throw res.error;
    if (res.status !== 0) {
        throw new Error(`命令执行失败：${command} ${args.join(' ')}`);
    }
}

/**
 * 清空目录（不存在则创建）
 */
function emptyDir(dir) {
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });
}

try {
    const webDist = path.join(rootDir, 'web', 'dist');
    const dist = path.join(rootDir, 'dist');

    emptyDir(webDist);
    console.log('已清除 web/dist 的所有文件');

    run('npm', ['run', 'build:vue']);
    console.log('前端资源编译完成...');

    emptyDir(dist);
    console.log('已清空构建结果目录 dist');

    run('npm', ['run', 'build:midway']);
    console.log('后台服务构建完成...');

    const distWeb = path.join(dist, 'web');
    fs.mkdirSync(distWeb, { recursive: true });
    fs.cpSync(webDist, distWeb, { recursive: true });
    console.log('已生成 dist/web，并把 web/dist 下所有文件复制进去');

    console.log('构建完成');
} catch (error) {
    console.error('构建失败:', error.message);
    process.exit(1);
}
