import { MidwayConfig, MidwayAppInfo } from '@midwayjs/core';
import * as path from 'path';
import devopsConfig from './devops.config';
export default (appInfo: MidwayAppInfo) => {
    console.log(appInfo);
    const webDist = path.join(__dirname, '../../web/dist/');
    const config = {
        // use for cookie sign key, should change to your own and keep security
        keys: appInfo.name + '_1641910879296_0612',
        cookies: {
            // 确保不设置secret，或者设置为空字符串
            secret: '', // 如果为空字符串，则关闭加密，但仍然可以解密已加密的cookies
            // ...
        },
        koa: {
            // 全局路由前缀
            globalPrefix: `${devopsConfig.prefixUrl}`,
            port: Number(process.env.PORT) || 7001,
            hostname: process.env.IP || '127.0.0.1',
        },
        typeorm: {
            dataSource: {
                default: {
                    type: 'mysql',
                    host: 'gz-cdb-2hrot0ff.sql.tencentcdb.com',
                    port: 29554,
                    username: 'root',
                    password: 'df@123456',
                    database: 'db_crontask',
                    synchronize: true,
                    // 或者扫描形式
                    entities: ['**/model/**/*{.ts,.js}'],
                },
            }
        },
        view: {
            //默认view目录
            defaultViewEngine: 'nunjucks',
            //默认view目录,本地开发目录必须在web下的，正式环境则是根目录下的view，因为web目录会被删
            rootDir: {
                default: path.join(webDist, 'view'),
            },
            mapping: {
                '.html': 'nunjucks',
            },
        },
        staticFile: {
            dirs: {
                default: {
                    prefix: `${devopsConfig.prefixUrl}/public`,
                    // 默认public目录
                    dir: path.join(webDist, 'public'),
                },
            },
        },
        /**
         * api相关配置
         */
        apiOption: {
            // 接口请求校验key
            key: '2024@fefeding#',
        },
        // 查看系统信息
        info: {
            infoPath: '/_sys_info',
        },
        axios: {
            default: {
                // 所有实例复用的配置
            },
            clients: {
                // 默认实例的配置
                default: {
                    // `headers` are custom headers to be sent
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    timeout: 1000, // default is `0` (no timeout)

                    // `withCredentials` indicates whether or not cross-site Access-Control requests
                    // should be made using credentials
                    withCredentials: false, // default
                },
            },
        },
        // 基础服务
        baseService: {
            manager: 'admin',// 管理员帐号
            appId: 2,
            url: 'https://api.jm47.com/base-server'
        },
        bodyParser: {
            formLimit: '30mb',
            jsonLimit: '30mb',
        },
    } as MidwayConfig;
    return config;
};
