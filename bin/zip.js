#!/usr/bin/env node

/**
 * @file 部署包打包脚本
 * @description 跨平台（Windows / macOS / Linux）替代 package.json 中的 rm -rf / zip 命令
 *
 * Windows 使用 PowerShell 的 Compress-Archive，其它平台使用 zip
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const zipName = 'server.zip';

/** 需要打包的文件/目录（相对项目根目录） */
const targets = [
    'dist',
    'package.json',
    'bootstrap.js',
    'docker/Dockerfile',
    'docker/.dockerignore',
    '.tpl.env',
    '.npmrc',
];

const exists = targets.filter((item) =>
    fs.existsSync(path.join(rootDir, item))
);
const missing = targets.filter((item) => !exists.includes(item));

if (missing.length) {
    console.warn('[zip] 以下文件不存在，已跳过：', missing.join(', '));
}
if (!exists.length) {
    console.error('[zip] 没有可打包的文件，请先执行 npm run build');
    process.exit(1);
}

const zipPath = path.join(rootDir, zipName);
if (fs.existsSync(zipPath)) {
    fs.rmSync(zipPath);
    console.log(`[zip] 已删除旧的 ${zipName}`);
}

let res;
if (process.platform === 'win32') {
    const paths = exists.map((item) => `'${item}'`).join(',');
    res = spawnSync(
        'powershell',
        [
            '-NoProfile',
            '-Command',
            `Compress-Archive -Path ${paths} -DestinationPath '${zipName}' -Force`,
        ],
        { stdio: 'inherit', cwd: rootDir }
    );
} else {
    res = spawnSync('zip', ['-r', zipName, ...exists], {
        stdio: 'inherit',
        cwd: rootDir,
    });
}

if (res.error) {
    console.error('[zip] 打包失败:', res.error.message);
    process.exit(1);
}

process.exit(res.status === null ? 1 : res.status);
