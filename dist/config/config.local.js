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
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmxvY2FsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbmZpZy9jb25maWcubG9jYWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2QkFBNkI7QUFDN0IsbURBQTJDO0FBRTNDLGtCQUFlLEdBQUcsRUFBRTtJQUNoQixPQUFPO1FBQ0gsSUFBSSxFQUFFO1lBQ0Ysb0RBQW9EO1lBQ3BELE9BQU8sRUFBRTtnQkFDTCxPQUFPLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsZ0JBQWdCLENBQUM7YUFDbEQ7U0FDSjtRQUNELE9BQU8sRUFBRSxFQUNSO1FBQ0QsVUFBVSxFQUFFO1lBQ1IsSUFBSSxFQUFFO2dCQUNGLE9BQU8sRUFBRTtvQkFDTCxNQUFNLEVBQUUsR0FBRyx1QkFBWSxDQUFDLFNBQVMsU0FBUztvQkFDMUMsYUFBYTtvQkFDYixHQUFHLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsa0JBQWtCLENBQUM7aUJBQ2hEO2FBQ0o7U0FDSjtLQUNKLENBQUM7QUFDTixDQUFDLENBQUMifQ==