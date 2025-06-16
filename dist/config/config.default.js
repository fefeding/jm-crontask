"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const devops_config_1 = require("./devops.config");
exports.default = (appInfo) => {
    console.log(appInfo);
    const webDist = path.join(__dirname, '../../dist/');
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
            globalPrefix: `${devops_config_1.default.prefixUrl}`,
            port: Number(process.env.PORT) || 8092,
            hostname: process.env.IP || '127.0.0.1',
        },
        typeorm: {
            dataSource: {
                default: {
                    type: 'mysql',
                    host: process.env.DB_HOST || '',
                    port: process.env.DB_PORT || 3306,
                    username: process.env.DB_USERNAME || '',
                    password: process.env.DB_PASSWORD || 'password',
                    database: 'db_crontask',
                    synchronize: true,
                    logging: false,
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
                default: path.join(webDist, '../view/'),
            },
            mapping: {
                '.html': 'nunjucks',
            },
        },
        staticFile: {
            dirs: {
                default: {
                    prefix: `${devops_config_1.default.prefixUrl}/public`,
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
            key: process.env.API_KEY || '2024@fefeding#',
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
                    timeout: 1000,
                    // `withCredentials` indicates whether or not cross-site Access-Control requests
                    // should be made using credentials
                    withCredentials: false, // default
                },
            },
        },
        // 基础服务
        baseService: {
            manager: 'admin',
            appId: process.env.APP_ID || 2,
            url: process.env.BASE_SERVER_URL || 'http://127.0.0.1:8089/base-server'
        },
        // 登陆相关配置
        sso: {
            baseUrl: process.env.SSO_URL || '',
        },
        bodyParser: {
            formLimit: '30mb',
            jsonLimit: '30mb',
        },
    };
    return config;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmRlZmF1bHQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29uZmlnL2NvbmZpZy5kZWZhdWx0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsNkJBQTZCO0FBQzdCLG1EQUEyQztBQUMzQyxrQkFBZSxDQUFDLE9BQXNCLEVBQUUsRUFBRTtJQUN0QyxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3JCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLGFBQWEsQ0FBQyxDQUFDO0lBQ3BELE1BQU0sTUFBTSxHQUFHO1FBQ1gsdUVBQXVFO1FBQ3ZFLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSSxHQUFHLHFCQUFxQjtRQUMxQyxPQUFPLEVBQUU7WUFDTCx3QkFBd0I7WUFDeEIsTUFBTSxFQUFFLEVBQUUsRUFBRSxtQ0FBbUM7WUFDL0MsTUFBTTtTQUNUO1FBQ0QsR0FBRyxFQUFFO1lBQ0QsU0FBUztZQUNULFlBQVksRUFBRSxHQUFHLHVCQUFZLENBQUMsU0FBUyxFQUFFO1lBQ3pDLElBQUksRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJO1lBQ3RDLFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxXQUFXO1NBQzFDO1FBQ0QsT0FBTyxFQUFFO1lBQ0wsVUFBVSxFQUFFO2dCQUNSLE9BQU8sRUFBRTtvQkFDTCxJQUFJLEVBQUUsT0FBTztvQkFDYixJQUFJLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLElBQUUsRUFBRTtvQkFDN0IsSUFBSSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxJQUFFLElBQUk7b0JBQy9CLFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsSUFBRSxFQUFFO29CQUNyQyxRQUFRLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLElBQUUsVUFBVTtvQkFDN0MsUUFBUSxFQUFFLGFBQWE7b0JBQ3ZCLFdBQVcsRUFBRSxJQUFJO29CQUNqQixPQUFPLEVBQUUsS0FBSztvQkFDZCxTQUFTO29CQUNULFFBQVEsRUFBRSxDQUFDLHdCQUF3QixDQUFDO2lCQUN2QzthQUNKO1NBQ0o7UUFDRCxJQUFJLEVBQUU7WUFDRixVQUFVO1lBQ1YsaUJBQWlCLEVBQUUsVUFBVTtZQUM3QixvREFBb0Q7WUFDcEQsT0FBTyxFQUFFO2dCQUNMLE9BQU8sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUM7YUFDMUM7WUFDRCxPQUFPLEVBQUU7Z0JBQ0wsT0FBTyxFQUFFLFVBQVU7YUFDdEI7U0FDSjtRQUNELFVBQVUsRUFBRTtZQUNSLElBQUksRUFBRTtnQkFDRixPQUFPLEVBQUU7b0JBQ0wsTUFBTSxFQUFFLEdBQUcsdUJBQVksQ0FBQyxTQUFTLFNBQVM7b0JBQzFDLGFBQWE7b0JBQ2IsR0FBRyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQztpQkFDcEM7YUFDSjtTQUNKO1FBQ0Q7O1dBRUc7UUFDSCxTQUFTLEVBQUU7WUFDUCxZQUFZO1lBQ1osR0FBRyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxJQUFJLGdCQUFnQjtTQUMvQztRQUNELFNBQVM7UUFDVCxJQUFJLEVBQUU7WUFDRixRQUFRLEVBQUUsWUFBWTtTQUN6QjtRQUNELEtBQUssRUFBRTtZQUNILE9BQU8sRUFBRTtZQUNMLFlBQVk7YUFDZjtZQUNELE9BQU8sRUFBRTtnQkFDTCxVQUFVO2dCQUNWLE9BQU8sRUFBRTtvQkFDTCwwQ0FBMEM7b0JBQzFDLE9BQU8sRUFBRTt3QkFDTCxrQkFBa0IsRUFBRSxnQkFBZ0I7cUJBQ3ZDO29CQUNELE9BQU8sRUFBRSxJQUFJO29CQUViLGdGQUFnRjtvQkFDaEYsbUNBQW1DO29CQUNuQyxlQUFlLEVBQUUsS0FBSyxFQUFFLFVBQVU7aUJBQ3JDO2FBQ0o7U0FDSjtRQUNELE9BQU87UUFDUCxXQUFXLEVBQUU7WUFDVCxPQUFPLEVBQUUsT0FBTztZQUNoQixLQUFLLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLElBQUksQ0FBQztZQUM5QixHQUFHLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLElBQUksbUNBQW1DO1NBQzFFO1FBQ0QsU0FBUztRQUNULEdBQUcsRUFBRTtZQUNELE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sSUFBSSxFQUFFO1NBQ3JDO1FBQ0QsVUFBVSxFQUFFO1lBQ1IsU0FBUyxFQUFFLE1BQU07WUFDakIsU0FBUyxFQUFFLE1BQU07U0FDcEI7S0FDWSxDQUFDO0lBQ2xCLE9BQU8sTUFBTSxDQUFDO0FBQ2xCLENBQUMsQ0FBQyJ9