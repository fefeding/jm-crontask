import { sysConfig } from '../domain/SysConfig';

// 引入后进行初始化
import Aegis from 'aegis-web-sdk';

const aegis = new Aegis({
    id: 'xEjpYiQvKly1nw5G1y', // 上报 id
    uin: sysConfig.session?.loginId || '',
    reportApiSpeed: true, // 接口测速
    reportAssetSpeed: true, // 静态资源测速
    spa: true, // spa 应用页面跳转的时候开启 pv 计算
    hostUrl: 'https://rumt-zh.com'
  });

export default aegis;