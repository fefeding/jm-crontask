"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const devops_config_1 = require("./devops.config");
exports.default = (appInfo) => {
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
            globalPrefix: `${devops_config_1.default.prefixUrl}`,
            port: Number(process.env.PORT) || 8092,
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
                    synchronize: false,
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
                default: path.join(webDist, 'view'),
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
            appId: 2,
            url: 'http://api.jm47.com/base-server'
        },
        bodyParser: {
            formLimit: '30mb',
            jsonLimit: '30mb',
        },
    };
    return config;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmRlZmF1bHQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29uZmlnL2NvbmZpZy5kZWZhdWx0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsNkJBQTZCO0FBQzdCLG1EQUEyQztBQUMzQyxrQkFBZSxDQUFDLE9BQXNCLEVBQUUsRUFBRTtJQUN0QyxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3JCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLGlCQUFpQixDQUFDLENBQUM7SUFDeEQsTUFBTSxNQUFNLEdBQUc7UUFDWCx1RUFBdUU7UUFDdkUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJLEdBQUcscUJBQXFCO1FBQzFDLE9BQU8sRUFBRTtZQUNMLHdCQUF3QjtZQUN4QixNQUFNLEVBQUUsRUFBRSxFQUFFLG1DQUFtQztZQUMvQyxNQUFNO1NBQ1Q7UUFDRCxHQUFHLEVBQUU7WUFDRCxTQUFTO1lBQ1QsWUFBWSxFQUFFLEdBQUcsdUJBQVksQ0FBQyxTQUFTLEVBQUU7WUFDekMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUk7WUFDdEMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLFdBQVc7U0FDMUM7UUFDRCxPQUFPLEVBQUU7WUFDTCxVQUFVLEVBQUU7Z0JBQ1IsT0FBTyxFQUFFO29CQUNMLElBQUksRUFBRSxPQUFPO29CQUNiLElBQUksRUFBRSxvQ0FBb0M7b0JBQzFDLElBQUksRUFBRSxLQUFLO29CQUNYLFFBQVEsRUFBRSxNQUFNO29CQUNoQixRQUFRLEVBQUUsV0FBVztvQkFDckIsUUFBUSxFQUFFLGFBQWE7b0JBQ3ZCLFdBQVcsRUFBRSxLQUFLO29CQUNsQixPQUFPLEVBQUUsS0FBSztvQkFDZCxTQUFTO29CQUNULFFBQVEsRUFBRSxDQUFDLHdCQUF3QixDQUFDO2lCQUN2QzthQUNKO1NBQ0o7UUFDRCxJQUFJLEVBQUU7WUFDRixVQUFVO1lBQ1YsaUJBQWlCLEVBQUUsVUFBVTtZQUM3QixvREFBb0Q7WUFDcEQsT0FBTyxFQUFFO2dCQUNMLE9BQU8sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUM7YUFDdEM7WUFDRCxPQUFPLEVBQUU7Z0JBQ0wsT0FBTyxFQUFFLFVBQVU7YUFDdEI7U0FDSjtRQUNELFVBQVUsRUFBRTtZQUNSLElBQUksRUFBRTtnQkFDRixPQUFPLEVBQUU7b0JBQ0wsTUFBTSxFQUFFLEdBQUcsdUJBQVksQ0FBQyxTQUFTLFNBQVM7b0JBQzFDLGFBQWE7b0JBQ2IsR0FBRyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQztpQkFDcEM7YUFDSjtTQUNKO1FBQ0Q7O1dBRUc7UUFDSCxTQUFTLEVBQUU7WUFDUCxZQUFZO1lBQ1osR0FBRyxFQUFFLGdCQUFnQjtTQUN4QjtRQUNELFNBQVM7UUFDVCxJQUFJLEVBQUU7WUFDRixRQUFRLEVBQUUsWUFBWTtTQUN6QjtRQUNELEtBQUssRUFBRTtZQUNILE9BQU8sRUFBRTtZQUNMLFlBQVk7YUFDZjtZQUNELE9BQU8sRUFBRTtnQkFDTCxVQUFVO2dCQUNWLE9BQU8sRUFBRTtvQkFDTCwwQ0FBMEM7b0JBQzFDLE9BQU8sRUFBRTt3QkFDTCxrQkFBa0IsRUFBRSxnQkFBZ0I7cUJBQ3ZDO29CQUNELE9BQU8sRUFBRSxJQUFJO29CQUViLGdGQUFnRjtvQkFDaEYsbUNBQW1DO29CQUNuQyxlQUFlLEVBQUUsS0FBSyxFQUFFLFVBQVU7aUJBQ3JDO2FBQ0o7U0FDSjtRQUNELE9BQU87UUFDUCxXQUFXLEVBQUU7WUFDVCxPQUFPLEVBQUUsT0FBTztZQUNoQixLQUFLLEVBQUUsQ0FBQztZQUNSLEdBQUcsRUFBRSxpQ0FBaUM7U0FDekM7UUFDRCxVQUFVLEVBQUU7WUFDUixTQUFTLEVBQUUsTUFBTTtZQUNqQixTQUFTLEVBQUUsTUFBTTtTQUNwQjtLQUNZLENBQUM7SUFDbEIsT0FBTyxNQUFNLENBQUM7QUFDbEIsQ0FBQyxDQUFDIn0=