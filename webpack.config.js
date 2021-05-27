'use strict';

const devops = require('./devops.config.js');
// 组合发布目录
const publicPath = devops.prefix? `/${devops.prefix}/public/` : '/public/';

module.exports = {
    entry: {
        home: 'app/web/page/index.ts'
    },
    output: {
        // 组合发布目录
        publicPath // '/项目的根路径名称/public/'
    },
    lib: ['vue', 'vuex', 'vue-router', 'vuex-router-sync', 'axios'],
    //https://www.yuque.com/easy-team/easywebpack/loader
    loaders: {
        babel: false,
        typescript: true
    },
    plugins: {
        copy: [
            {
                from: 'app/web/asset',
                to: 'asset'
            }
        ]
    }
};
