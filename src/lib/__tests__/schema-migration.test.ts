import * as fs from 'fs';
import * as path from 'path';
import { getMetadataArgsStorage } from 'typeorm';
import TaskConfig from '../../model/taskConfig';
import TaskInstance from '../../model/taskInstance';

/**
 * 校验实体字段与数据库迁移脚本保持一致
 *
 * 项目已关闭 TypeORM 的 synchronize，表结构统一由 data/migrations 下的
 * 迁移脚本管理。一旦实体加了字段而忘记写迁移，运行期就会报 Unknown column。
 * 这里用测试把这种漂移挡在 CI 之前。
 */
describe('实体与迁移脚本一致性', () => {
    const migrationsDir = path.join(process.cwd(), 'data', 'migrations');

    /** 读取所有迁移脚本，合并出每个表的完整字段定义 */
    const tableColumns = new Map<
        string,
        Map<string, { type: string; length?: number }>
    >();

    beforeAll(() => {
        const files = fs
            .readdirSync(migrationsDir)
            .filter(f => f.endsWith('.sql'))
            .sort();

        for (const file of files) {
            const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

            // CREATE TABLE `xxx` ( ... )
            const createRegex =
                /CREATE TABLE IF NOT EXISTS `(\w+)`\s*\(([\s\S]*?)\n\)/g;
            let match: RegExpExecArray | null;
            while ((match = createRegex.exec(sql))) {
                const table = match[1];
                const body = match[2];
                const cols = tableColumns.get(table) || new Map();
                for (const line of body.split('\n')) {
                    const colMatch = line.match(/^\s*`(\w+)`\s+([a-z]+)/i);
                    if (colMatch) {
                        cols.set(colMatch[1], {
                            type: colMatch[2].toLowerCase(),
                        });
                    }
                }
                tableColumns.set(table, cols);
            }

            // ALTER TABLE `xxx` ADD COLUMN `yyy` type ...
            const alterRegex = /ALTER TABLE `(\w+)`([\s\S]*?);/g;
            while ((match = alterRegex.exec(sql))) {
                const table = match[1];
                const body = match[2];
                const cols = tableColumns.get(table) || new Map();
                const addRegex = /ADD COLUMN `(\w+)`\s+([a-z]+)(\((\d+)\))?/gi;
                let add: RegExpExecArray | null;
                while ((add = addRegex.exec(body))) {
                    cols.set(add[1], {
                        type: add[2].toLowerCase(),
                        length: add[4] ? Number(add[4]) : undefined,
                    });
                }
                tableColumns.set(table, cols);
            }
        }
    });

    const cases: [string, any][] = [
        ['t_task_config', TaskConfig],
        ['t_task_instance', TaskInstance],
    ];

    it.each(cases)('%s 的字段在迁移脚本中均有对应定义', (tableName, entity) => {
        const storage = getMetadataArgsStorage();
        const tableMeta = storage.tables.find(t => t.target === entity);
        expect(tableMeta).toBeTruthy();

        const cols = tableColumns.get(tableName);
        expect(cols).toBeTruthy();

        // 实体自身声明的列（基类字段由 BaseEntity 提供，不在迁移校验范围内）
        const entityColumns = storage.columns.filter(c => c.target === entity);

        const missing: string[] = [];
        const typeMismatch: string[] = [];

        for (const col of entityColumns) {
            // 数据库列名优先（实体里用 name 指定了 F 前缀的列名）
            const dbName = String(col.options.name || col.propertyName);
            const sql = cols!.get(dbName);
            if (!sql) {
                missing.push(dbName);
                continue;
            }
            // 主键等未显式声明类型的列（type 为构造函数），跳过类型比对
            if (typeof col.options.type !== 'string') continue;
            const declaredType = String(col.options.type).toLowerCase();
            if (declaredType && sql.type && declaredType !== sql.type) {
                typeMismatch.push(
                    `${dbName}: 实体=${declaredType} 迁移=${sql.type}`
                );
            }
        }

        expect(missing).toEqual([]);
        expect(typeMismatch).toEqual([]);
    });
});
