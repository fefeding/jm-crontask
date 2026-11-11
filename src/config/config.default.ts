/**
 * @file 默认配置
 * @description Midway.js 应用默认配置，包含数据库、Session、COS 等核心配置
 * @author fefeding
 *
 * 配置优先级：环境变量 > 配置文件
 * 所有敏感配置（密码、密钥等）应通过 .env 环境变量注入
 */
import * as path from 'path';
import type { MidwayConfig, MidwayAppInfo } from '@midwayjs/core';
import devopsConfig, { isJsonStorage } from './devops.config';
import { JsonDataSource } from '@fefeding/typeorm-storage';

// JSON 回退存储的落盘目录，默认 <root>/data/db，可用 JSON_STORAGE_DIR 覆盖。
const jsonDbDir = process.env.JSON_STORAGE_DIR
    ? path.resolve(process.env.JSON_STORAGE_DIR)
    : path.join(__dirname, '../../data/db');

const jsonDataSource = isJsonStorage
    ? {
          type: 'json',
          customDataSourceClass: JsonDataSource,
          dbDir: jsonDbDir,
      }
    : {};

/**
 * 导出配置工厂函数
 * @param appInfo - Midway 应用信息
 * @returns 应用配置对象
 */
export default (appInfo: MidwayAppInfo) => {
    const config = {
        // 部署配置（通过 @Config('devops') 注入）
        devops: devopsConfig,
        // use for cookie sign key, should change to your own and keep security
        // keys: (SESSION_SECRET || 'dev-secret') + '_' + appInfo.name,
        koa: {
            // 全局路由前缀
            globalPrefix: `${devopsConfig.prefixUrl}`,
            // cookie 签名密钥（会话 cookie 依赖它，保留原有行为）
            // koa 的 keys 要求为数组
            keys: [appInfo.name + '_1641910879296_0612'],
            port: Number(process.env.PORT) || 8000,
            hostname: process.env.IP || '0.0.0.0',
            // 信任反向代理传递的 X-Forwarded-* 头（含 X-Forwarded-Proto），
            // 使 ctx.protocol/ctx.origin 正确反映外部 https 访问，
            // 避免未登录跳转 SSO 时 redirect_uri 被生成为 http://
            proxy: true,
        },
        // 本地 JSON 回退存储开关（@Config('jsonStorage') 读取）：
        // true 表示 JSON_STORAGE=local|json，数据落盘 JSON 文件替代 MySQL；
        // false 表示使用下方 typeorm 配置的真实 MySQL。
        jsonStorage: isJsonStorage,
        typeorm: {
            dataSource: {
                default: {
                    type: 'mysql',
                    host: process.env.DB_HOST || '',
                    port: process.env.DB_PORT || 3306,
                    username: process.env.DB_USERNAME || '',
                    password: process.env.DB_PASSWORD || 'password',
                    database: process.env.DB_DATABASE || 'db_crontask',
                    // 表结构变更走 bin/migrate.js，不要开 synchronize=true：
                    // MySQL 常开 sql_require_primary_key=ON，TypeORM 同步主键漂移会
                    // 触发 ALTER TABLE DROP PRIMARY KEY 被拒（errno 1173）。
                    synchronize: false,
                    // 关闭 SQL query 日志，避免自动化轮询等高频查询刷屏（保留 error/warn 便于排障）
                    logging: ['error', 'warn'],
                    // 连接池与超时配置：减少 read ETIMEDOUT（空闲连接被 RDS 回收 / 网络抖动）
                    extra: {
                        connectionLimit:
                            Number(process.env.DB_CONNECTION_LIMIT) || 10,
                        connectTimeout:
                            Number(process.env.DB_CONNECT_TIMEOUT) || 10000,
                        enableKeepAlive: true,
                        keepAliveInitialDelay: 10000,
                    },
                    poolErrorHandler: err => {
                        console.warn(
                            '[typeorm] 连接池错误，将自动重建连接',
                            err?.code || err
                        );
                    },
                    // 本项目实体（glob 扫描，覆盖 .entity 与非 .entity 命名）
                    entities: ['**/model/**/*{.ts,.js}'],
                    ...jsonDataSource,
                },
            },
        },
        api: {
            baseUrl: process.env.API_URL || '',
        },
        // 接口文档（Swagger），访问地址：{host}{prefixUrl}/swagger-ui/index.html
        swagger: {
            title: devopsConfig.siteTitle,
            description: `${devopsConfig.siteTitle} 接口文档`,
            version: '1.0.0',
        },
        session: {
            // session 过期设置
            timeout: Number(process.env.SESSION_TIMEOUT) || 20 * 60 * 1000,
            // Session 存储 key（与基础组件约定，勿删除，否则会话无法落库）
            serviceKey: 'session:service',
        },
        // 静态文件服务
        staticFile: {
            dirs: {
                default: {
                    prefix: `${devopsConfig.prefixUrl}/public`,
                },
            },
            gzip: true,
        },
        // 登陆态校验配置
        auth: {
            // 忽略登陆态校验
            ignores: [/\/api\/test\//i, '/api/test/action'],
        },
        // 基础服务
        baseService: {
            manager: ['admin', 'fefeding'], // 管理员帐号
        },
        busboy: {
            mode: 'file',
            cleanTimeout: 5 * 60 * 1000,
            // 文件大小限制（默认 10MB）
            fileSize:
                Number(process.env.UPLOAD_MAX_FILE_SIZE) || 10 * 1024 * 1024,
            // 后缀白名单（null = 允许所有文件类型，用于连接器导入等场景）
            whitelist: null,
        },
        // 应用 UI / 站点配置
        app: {
            title: process.env.TITLE || '系统',
            // 站点域名：优先使用 SITE_URL（生产/反向代理域名）；
            // 未配置时由 koa 端口 + 部署前缀组合回环地址，
            // 保证始终存在一个可访问的 HTTP 连接。
            siteUrl: (
                process.env.SITE_URL ||
                `http://127.0.0.1:${Number(process.env.PORT) || 7001}${
                    devopsConfig.prefixUrl || ''
                }`
            ).replace(/\/+$/, ''),
        },
        tencentCosOption: {
            default: {
                Bucket: process.env.TENCENT_COS_DEFAULT_BUCKET || '',
                Region:
                    process.env.TENCENT_COS_DEFAULT_REGION || 'ap-guangzhou',
                Domain: process.env.TENCENT_COS_DEFAULT_DOMAIN || '',
                Protocol: process.env.TENCENT_COS_DEFAULT_PROTOCOL || '',
                CompatibilityMode: true,
                url: '',
            },
        },
        // 做为任务调度中心时的配置
        master: {
            node:
                process.env.TASK_NODE !== '0' &&
                process.env.TASK_NODE !== 'false', //是否做为节点执行任务
            // 调度器最小轮询间隔（毫秒）
            minInterval: Number(process.env.TASK_MIN_INTERVAL) || 200,
            // 调度器最大轮询间隔（毫秒），无任务时休眠到此长度
            maxInterval: Number(process.env.TASK_MAX_INTERVAL) || 30000,
            // 单个节点最大并发执行任务数
            maxRunningCount: Number(process.env.TASK_MAX_RUNNING) || 5,
            // 单次补偿的最大执行次数
            maxCatchUp: Number(process.env.TASK_MAX_CATCH_UP) || 10,
        },
        // 任务执行器配置
        executor: {
            // 临时工作目录根
            workRoot: process.env.TASK_WORK_ROOT || '',
            // 子进程内允许 require 的模块白名单
            requireAllowList: [
                'fs',
                'path',
                'os',
                'crypto',
                'util',
                'url',
                'querystring',
                'zlib',
                'stream',
                'events',
                'http',
                'https',
                'moment',
                'axios',
            ],
        },
        // 通知与告警配置
        notify: {
            channels: [
                { type: 'log', enabled: true, level: 'error' },
                { type: 'console', enabled: false },
                {
                    type: 'webhook',
                    enabled: false,
                    url: '',
                    headers: {},
                    timeout: 5000,
                },
                { type: 'wecom', enabled: false, url: '', timeout: 5000 },
                {
                    type: 'dingtalk',
                    enabled: false,
                    url: '',
                    secret: '',
                    timeout: 5000,
                },
            ],
            receivers: [],
            rules: {
                notifyOnFailure: true,
                notifyOnTimeout: true,
                consecutiveFailureThreshold: 3,
                notifyOnRecover: true,
                notifyOnMissed: true,
                notifyOnInvalidConfig: true,
            },
        },
        // 维护任务配置（日志归档、实例清理、产物清理）
        maintain: {
            enabled: process.env.TASK_MAINTAIN !== '0',
            // 实例记录保留天数，0 表示不清理
            instanceRetentionDays:
                Number(process.env.TASK_INSTANCE_RETENTION) || 30,
            // 日志文件保留天数，0 表示不清理
            logRetentionDays: Number(process.env.TASK_LOG_RETENTION) || 30,
            // 产物备份保留天数，0 表示不清理
            publishRetentionDays:
                Number(process.env.TASK_PUBLISH_RETENTION) || 30,
            // 维护周期（毫秒）
            interval: Number(process.env.TASK_MAINTAIN_INTERVAL) || 3600000,
        },
    } as MidwayConfig;
    return config;
};
