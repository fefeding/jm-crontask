import * as path from 'path';
import devopsConfig from './devops.config';

export default () => {
    return {
        view: {
            //默认view目录,本地开发目录必须在web下的，正式环境则是根目录下的view，因为web目录会被删
            rootDir: {
                default: path.join(__dirname, '../../web/view'),
            },
        },
        koa: {
            // 全局路由前缀
            globalPrefix: `${devopsConfig.prefixUrl}`,
            port: Number(process.env.PORT) || 8091,
            hostname: process.env.IP || '127.0.0.1',
        },
        typeorm: {
            // dataSource: {
            //     default: {
            //         type: 'mysql',
            //         host: 'server.jm47.com',
            //         port: 3306,
            //         username: 'fefeding',
            //         password: 'df@123456',
            //         database: 'db_school',
            //         synchronize: true,
            //         // 或者扫描形式
            //         entities: ['**/model/**/*{.ts,.js}'],
            //     },
            // },
        },
        staticFile: {
            dirs: {
                default: {
                    prefix: `${devopsConfig.prefixUrl}/public`,
                    // 默认public目录
                    dir: path.join(__dirname, '../../web/public'),
                },
            },
        },
        //基础服务
        baseService: {
            url: 'http://127.0.0.1:7002/base-server'
        },
    };
};
