"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const devops_config_1 = require("./devops.config");
exports.default = () => {
    return {
        view: {
            //默认view目录,本地开发目录必须在web下的，正式环境则是根目录下的view，因为web目录会被删
            rootDir: {
                default: path.join(__dirname, '../../web/view'),
            },
        },
        koa: {
            // 全局路由前缀
            globalPrefix: `${devops_config_1.default.prefixUrl}`,
            port: Number(process.env.PORT) || 8091,
            hostname: process.env.IP || '127.0.0.1',
        },
        typeorm: {},
        staticFile: {
            dirs: {
                default: {
                    prefix: `${devops_config_1.default.prefixUrl}/public`,
                    // 默认public目录
                    dir: path.join(__dirname, '../../web/public'),
                },
            },
        },
        //基础服务
        baseService: {
        //url: 'http://127.0.0.1:7002/base-server'
        },
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmxvY2FsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbmZpZy9jb25maWcubG9jYWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2QkFBNkI7QUFDN0IsbURBQTJDO0FBRTNDLGtCQUFlLEdBQUcsRUFBRTtJQUNoQixPQUFPO1FBQ0gsSUFBSSxFQUFFO1lBQ0Ysb0RBQW9EO1lBQ3BELE9BQU8sRUFBRTtnQkFDTCxPQUFPLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsZ0JBQWdCLENBQUM7YUFDbEQ7U0FDSjtRQUNELEdBQUcsRUFBRTtZQUNELFNBQVM7WUFDVCxZQUFZLEVBQUUsR0FBRyx1QkFBWSxDQUFDLFNBQVMsRUFBRTtZQUN6QyxJQUFJLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSTtZQUN0QyxRQUFRLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksV0FBVztTQUMxQztRQUNELE9BQU8sRUFBRSxFQUNSO1FBQ0QsVUFBVSxFQUFFO1lBQ1IsSUFBSSxFQUFFO2dCQUNGLE9BQU8sRUFBRTtvQkFDTCxNQUFNLEVBQUUsR0FBRyx1QkFBWSxDQUFDLFNBQVMsU0FBUztvQkFDMUMsYUFBYTtvQkFDYixHQUFHLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsa0JBQWtCLENBQUM7aUJBQ2hEO2FBQ0o7U0FDSjtRQUNELE1BQU07UUFDTixXQUFXLEVBQUU7UUFDVCwwQ0FBMEM7U0FDN0M7S0FDSixDQUFDO0FBQ04sQ0FBQyxDQUFDIn0=