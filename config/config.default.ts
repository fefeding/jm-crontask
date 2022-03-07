const devops = require('../devops.config.js');

import { EggAppConfig } from 'egg';
import * as fs from 'fs';
import * as path from 'path';

export default (appInfo: EggAppConfig) => {
    const config: any = {
        title: '定时任务系统',
        prefix: devops.prefix || '' // 部署目录名称
    };

    // 组合发布目录
    // 当nginx把目录带下来时，就需要加上目录名，否则不需要。这里暂时不清楚为什么有些nginx会带有些不会带
    //  devops.prefix? `/${devops.prefix}/docs/` :
    const publicPath = devops.prefix? `/${devops.prefix}/public/`:'/public/';
    const docsPath = devops.prefix? `/${devops.prefix}/docs/`:'/docs/';

    config.static = {
        maxAge: 0, // maxAge 缓存，默认 1 年
        prefix: publicPath,
        dir: [
            path.join(appInfo.baseDir, 'public'),
            {
                prefix: docsPath,
                dir: path.join(appInfo.baseDir, 'docs')
            }
        ]
    };

    config.vuessr = {
        layout: path.resolve(appInfo.baseDir, 'app/web/view/layout.html'),
        renderOptions: {
            basedir: path.join(appInfo.baseDir, 'app/view')
        }
    };

    // session配置
    /*config.session = {
	  key: 'JM_SESSION',
	  maxAge: 24 * 3600 * 1000, // 1 天
	  httpOnly: true,
	  encrypt: true,
	}*/

    // 中间件access配置
    // 用来请求鉴权  只需要针对/api/ 这类的service请求
    // 计算方法 md5(accessKey + ',' + timestamp)
    config.apiAccess = {
        enabled: true, // false 表示不启用鉴权
        timeout: 300000, // timestamp超时设置，不配不检查超时
        accessKey: 'jm.2022' // 用来计算token的当前系统唯一key
    };

    // 中间件
    config.middleware = [
        'access',
        'api' // api请求规范
    ];

    // 任务开启执行开关
    config.task = {
        enable: true
    };

    // 访问权限
    config.managers = {
        users: [
            92
        ]
    }
    return config;
};
