// 给TAF调用的入口文件

const egg = require('egg');
const tarsConfig = require('./tarsConfig.js');

const options = {
    env: 'prod',
    port: process.env.PORT || 8082,
    host: process.env.IP || '127.0.0.1',
    workers: 1
};

async function start(options) {
    const app = await egg.start(options);
    try {
        // 加载基础服务配置
        const commonConf = await tarsConfig.loadAndWatchConfig('common.conf', {
            format: 'JSON',
            // 被动更新配置
            configPushed: (conf) => {
                console.log(conf);
                // 合并tars配置
                app.config.common = Object.assign(app.config.common, conf);
            }
        });
        // 合并tars配置
        if(commonConf) app.config.common = Object.assign(app.config.common, commonConf);
    }
    catch(e) {
        console.log(e);
    }
    app.listen(options.port, options.host);
    console.log(`server listen at ${options.host}:${options.port}`);
}

start(options);


//egg.startCluster(options);
