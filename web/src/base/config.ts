// 基础配置

const config =
    (window.__INITIAL_STATE__ && window.__INITIAL_STATE__.config) || {};
const prefix = config.prefix || '';
export default {
    ...config,
    prefix,
    // api的根URL
    baseURL: `${location.origin}` + prefix,
    // xhr的超时时间
    timeout: 3e4,
    logUrl: prefix + '/api/monitor/log',
};
