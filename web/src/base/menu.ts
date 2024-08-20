
import config from '@/base/config';
/**
 * 管理端菜单
 */
export default {
    home: {
      path: '/admin/home',
      icon: 'HomeFilled',
      name: '首页',
    },
    school: {
      path: '/admin/task/list',
      icon: 'Tickets',
      name: '任务管理',
    },
    classroom: {
      path: '/admin/task/instance',
      icon: 'StarFilled',
      name: '运行实例',
    },  
    // activity: {
    //   path: '/admin/task/log',
    //   icon: 'DocumentCopy',
    //   name: '运行日志',
    // },
    // account: {
    //   path: '/admin/account',
    //   icon: 'User',
    //   name: '帐号管理',
    //   disabled: config.isManager,
    // },
  }