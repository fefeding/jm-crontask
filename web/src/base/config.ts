// 基础配置
import { sysConfig } from '../domain/SysConfig';
const config =
    (window.__INITIAL_STATE__ && window.__INITIAL_STATE__.config) || {};
const prefix = config.prefix || '';
export default {
    ...config,
    isManager: sysConfig.isManager,
    prefix,
    // api的根URL
    baseURL: `${location.origin}` + prefix,
    // xhr的超时时间
    timeout: 3e4,
    logUrl: prefix + '/api/monitor/log',
};
