/**
 * @file 部署配置
 * @description 定义 URL 前缀、系统标题等部署相关配置，以及 JSON 回退存储开关
 * @author fefeding
 *
 * PREFIX 环境变量用于部署到子路径，如 /my-project
 * prefixUrl 用于生成完整的 URL 前缀
 *
 * 安全约束：一个 DB 实例只能跑一种模式，切换需停服迁移
 */

import {utils} from '@cicctencent/midwayjs-base';

utils.loadEnv();

const PREFIX =  process.env.PREFIX || '';

/**
 * 是否启用本地 JSON 回退存储（替代 MySQL）
 *
 * 判定优先级：
 * 1. 显式开启：.env 设置 JSON_STORAGE=local|json 或 DISABLE_DB=true，
 *    数据以 JSON 文件落盘到 data/db/<表名>/<主键>.json，业务层 TypeORM 代码零改动；
 * 2. 显式关闭：JSON_STORAGE 设置为其它值（如 mysql）时走真实数据库；
 * 3. 未设置 JSON_STORAGE 时自动探测：DB_HOST 为空（未配置数据库）则自动回退
 *    JSON 存储，避免启动即尝试连接 MySQL 报 ECONNREFUSED；
 *    DB_HOST 非空则走 config.default.ts 的 MySQL 配置。
 *
 * 注意：项目自带的 .tpl.env 模板默认显式声明 JSON_STORAGE=local，
 * 因此「开箱即用 → 本地 JSON 存储」是配置的确定性结果，而不依赖第 3 条的隐式推断；
 * 要使用 MySQL 必须显式改为 JSON_STORAGE=mysql 并补齐 DB_* 配置。
 * 第 3 条仅为兼容未声明该变量的历史 .env 而保留。
 *
 * 放在本文件的原因：config.default.ts / config.local.ts 属于 Midway 的 config 文件，
 * 只能有 default export（同时存在命名导出会抛 MIDWAY_10014），
 * 而 configuration.ts 与 config.local.ts 都需要在加载期读到该开关，
 * 故收敛到已有的共享常量模块，避免重复解析环境变量。
 */
export const isJsonStorage =
    process.env.DISABLE_DB === 'true' ||
    process.env.JSON_STORAGE === 'local' ||
    process.env.JSON_STORAGE === 'json' ||
    (!process.env.JSON_STORAGE && !(process.env.DB_HOST || '').trim());

export default {
    /** 前缀字符串 */
    prefix: PREFIX,
    /** URL 前缀（含前导斜杠） */
    prefixUrl: PREFIX ? `/${PREFIX}` : '',
    /** 系统标题 */
    siteTitle: process.env.TITLE || '定时任务系统',
};
