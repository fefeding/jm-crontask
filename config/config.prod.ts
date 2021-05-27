/**
 * production
 *
 *  prod + default（override）
 */

import * as path from 'path';
import { Application, EggAppConfig } from 'egg';

export default (appInfo: EggAppConfig) => {
    const exports: any = {};
    /**
     * DB 测试库
     * https://typeorm.io/#/connection-options/mysql--mariadb-connection-options
     */
    const jvMysql = {
        name: 'default',
        type: 'mysql',
        host: 'localhost',
        port: '3306',
        username: 'root',
        password: '123456',
        database: 'db_jv_crontask',
        charset: 'utf8',
        useUTC: true,
        synchronize: false,
        logging: false,
        entities: [path.join(appInfo.baseDir, 'app/model/**/*.js')],
        extra: {
            connectionLimit:  5, // 连接池最大连接数量, 查阅资料 建议是  core number  * 2 + n
        }
    };

    exports.mysql = {
        // database configuration
        clients: [jvMysql]
    };

    // 消息通知配置
    exports.watcher = {
        logUrl: '',
        companyId: 2
    }

    return exports;
};
