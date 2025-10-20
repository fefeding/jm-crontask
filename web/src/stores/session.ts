import { defineStore } from 'pinia';
import type { User } from '@fefeding/common/dist/models/account/user';
//import type Account from '@fefeding/common/dist/models/account/account';
import type { Session, } from '@fefeding/common/dist/models/account/session';
import { sysConfig } from '@/domain/SysConfig';


// 定义会话状态类型
export type SessionState = Session & {
  lastDate: number
  iat: number
}

// 初始状态
const defaultState: SessionState = sysConfig.session;

export const useSessionStore = defineStore('session', {
  state: (): SessionState => ({ ...defaultState }),
  
  getters: {
    // 是否登录
    isLoggedIn: (state) => !!state.id && !!state.userId,
    
    // 获取用户名
    userName: (state) => state.user?.name || '',
    
    // 获取登录ID
    userLoginId: (state) => state.loginId,
    
    // 获取用户头像
    userAvatar: (state) => state.user?.avatar || ''
  },
  
  actions: {
    // 设置登录状态
    setSession(session: Partial<SessionState>) {
      Object.assign(this, session)
    },
    
    // 清除登录状态（退出登录）
    clearSession() {
      this.user = null as any;
      this.account = null as any;
      this.id = '';
      this.userId = 0;
      this.loginId = '';
    },
    
    // 更新用户信息
    updateUserInfo(user: Partial<User>) {
      if(this.user) Object.assign(this.user, user)
    },
  },
  
  // 持久化存储配置（需要安装pinia-plugin-persistedstate）
//   persist: {
//     key: 'app-session',
//     storage: sessionStorage, // 可选sessionStorage
//     paths: ['lastDate', 'id', 'loginId', 'user', 'account', 'userId', 'iat']
//   }
})
