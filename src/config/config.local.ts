/**
 * @file 本地开发配置
 * @description 仅在 NODE_ENV=local 时生效的配置覆盖
 * @author fefeding
 *
 * 本地开发特有配置：
 * 1. 视图目录指向 web/view（开发时前后端分离）
 * 2. 数据源：JSON_STORAGE=local|json 时用 JsonDataSource 落盘 JSON，
 *    否则沿用默认 MySQL（synchronize=false，表结构变更走 bin/migrate.js 迁移）。
 *    注意：不要用 synchronize=true。MySQL 服务端常开 sql_require_primary_key=ON，
 *    TypeORM 同步主键列漂移时会执行 ALTER TABLE DROP PRIMARY KEY 被拒绝（errno 1173）。
 * 3. 静态文件目录指向 web/public
 */
/// <reference types="node" />
import * as path from 'path';
import devopsConfig from './devops.config';

// 说明：本文件在 IDE 单文件类型检查上下文中未自动注入 @types/node 全局声明，
// 导致 path 模块与 __dirname 无法解析；顶部三斜线指令显式引入 node 类型以满足 TS。
// 运行时本配置以 CommonJS 加载，__dirname 真实存在，行为不变。

export default () => {
    const webDir = path.join(__dirname, '../../web/');
    return {
        view: {
            // 默认view目录，本地开发目录必须在web下，正式环境则是根目录下的view
            rootDir: {
                default: path.join(webDir, 'view'),
            },
        },
        // 本地数据源配置：
        //  - JSON 回退存储：type:'json' + customDataSourceClass: JsonDataSource，
        //    @midwayjs/typeorm 会直接构造 JSON DataSource，@InjectDataSource /
        //    @InjectEntityModel 业务代码零改动；数据落盘到 <dbDir>/<table>/<pk>.json。
        //  - 否则沿用默认 MySQL（synchronize=false，表结构变更一律走 bin/migrate.js）。
        //    不要用 synchronize=true：MySQL 常开 sql_require_primary_key=ON，
        //    TypeORM 同步主键漂移会触发 ALTER TABLE DROP PRIMARY KEY 被拒（errno 1173）。
        typeorm: {
            dataSource: {
                default: {
                    synchronize: true,
                    lazy: true,
                },
            },
        },
        staticFile: {
            dirs: {
                default: {
                    prefix: `${devopsConfig.prefixUrl}/public`,
                    dir: path.join(webDir, 'public'),
                },
            },
        },
    };
};
