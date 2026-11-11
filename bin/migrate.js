#!/usr/bin/env node

/**
 * @file 数据库迁移脚本
 * @description 按文件名顺序执行 data/migrations/*.sql，已执行的记录在 schema_migrations 表，
 *              重复执行安全（幂等）。配合 config.default.ts 的 synchronize:false 使用：
 *              应用不自动改表，表结构变更一律走这里。
 *
 * 用法：
 * - node bin/migrate.js             执行尚未应用的迁移
 * - node bin/migrate.js --dry-run   只打印将要执行的迁移，不连库不落库
 *
 * 环境变量（与 config.default.ts 的 typeorm 配置一致）：
 * - DB_HOST / DB_PORT / DB_USERNAME / DB_PASSWORD / DB_DATABASE
 *
 * 特殊情况：DISABLE_DB=true 或 JSON_STORAGE=local|json 时为本地 JSON 回退存储模式，
 * 数据落盘 JSON 文件、无需建表，直接跳过。
 */

const fs = require('fs');
const path = require('path');

// 加载项目根目录 .env（数据库连接配置）；已存在的环境变量优先，不被 .env 覆盖。
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const MIGRATIONS_DIR = path.join(__dirname, '..', 'data', 'migrations');
const DRY_RUN = process.argv.includes('--dry-run');

const CREATE_TABLE_SQL =
    'CREATE TABLE IF NOT EXISTS `schema_migrations` (' +
    '`id` varchar(255) NOT NULL,' +
    '`applied_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,' +
    'PRIMARY KEY (`id`)' +
    ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;';

/**
 * 是否处于 JSON 回退存储模式（无 MySQL，无需建表）
 */
function isJsonStorageMode() {
    return (
        process.env.DISABLE_DB === 'true' ||
        process.env.JSON_STORAGE === 'local' ||
        process.env.JSON_STORAGE === 'json'
    );
}

/**
 * 列出待执行的迁移文件（按文件名升序，文件名即执行顺序）
 */
function listMigrationFiles() {
    if (!fs.existsSync(MIGRATIONS_DIR)) return [];
    return fs
        .readdirSync(MIGRATIONS_DIR)
        .filter(name => name.endsWith('.sql'))
        .sort();
}

async function main() {
    if (isJsonStorageMode()) {
        console.log(
            '[migrate] 检测到 JSON 回退存储模式（数据落盘 JSON 文件，无需建表），跳过数据库迁移。'
        );
        return;
    }

    const files = listMigrationFiles();
    if (!files.length) {
        console.log('[migrate] 没有待执行的迁移文件。');
        return;
    }

    if (DRY_RUN) {
        console.log('[migrate] --dry-run 模式，以下迁移将被执行：');
        files.forEach(file => console.log('  - ' + file));
        return;
    }

    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_DATABASE || 'db_crontask',
        multipleStatements: true,
    });

    try {
        await connection.query(CREATE_TABLE_SQL);

        const rows = await connection.query(
            'SELECT `id` FROM `schema_migrations`'
        );
        const applied = new Set(rows[0].map(row => row.id));

        let executed = 0;
        for (const file of files) {
            if (applied.has(file)) {
                console.log('[migrate] skip  ' + file + '（已执行）');
                continue;
            }
            const sql = fs.readFileSync(
                path.join(MIGRATIONS_DIR, file),
                'utf8'
            );
            console.log('[migrate] apply ' + file);
            await connection.query(sql);
            await connection.query(
                'INSERT INTO `schema_migrations` (`id`) VALUES (?)',
                [file]
            );
            executed++;
        }

        console.log('[migrate] 完成，本次执行 ' + executed + ' 个迁移。');
    } finally {
        await connection.end();
    }
}

main().catch(err => {
    console.error(
        '[migrate] 执行失败：',
        err && err.message ? err.message : err
    );
    process.exit(1);
});
