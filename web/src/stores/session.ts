import { defineStore } from 'pinia';
import type { User } from '@cicctencent/common/dist/models/account/user';
//import type Account from '@cicctencent/common/dist/models/account/account';
import type { Session, } from '@cicctencent/common/dist/models/account/session';
import { sysConfig } from '@/domain/SysConfig';
import { resolveSessionSource } from '@/utils/login-policy';


// 定义会话状态类型
export type SessionState = Session & {
  lastDate: number
  iat: number,
}

const storage = window.sessionStorage;

const sessionStoreKey = 'login-session';

/**
 * 空会话的完整字段集。
 *
 * pinia ≥3（3.x / 4.x 行为一致）的 options store 会把 state 展开为 store 上的顶层属性，
 * 其实现是 `toRefs(state)` —— **只在 store 创建时对当时已存在的键取一次快照**。
 * 初始 state 若为 `{}`，快照里就没有任何键；此后 setSession 写入的
 * id / userId / user 等字段只存在于 `store.$state`，store 顶层取不到，
 * 于是 `store.user`（侧边栏显示用户名）、`storeToRefs()` 等全部失效，
 * isLoggedIn 也永远读不到 id/userId。
 *
 * 故初始状态必须给出完整字段集，保证 store 顶层属性齐全。
 */
function emptySession(): SessionState {
  return {
    id: '',
    loginId: '',
    userId: 0,
    user: null as User | null,
    account: null as any,
    code: '',
    appId: 0,
    lastDate: 0,
    iat: 0,
  } as unknown as SessionState;
}

/** 读取本地持久化的会话（可能已过期，仅作服务端无信号时的回退） */
function readLocalSession(): Partial<SessionState> | undefined {
  try {
    const raw = storage.getItem(sessionStoreKey);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : undefined;
  } catch (e) {
    console.error('Failed to read session from sessionStorage:', e);
    return undefined;
  }
}

/**
 * 从服务端快照与本地持久化会话中解析出初始状态。
 *
 * 登录态以**服务端注入的会话**（`sysConfig.session`，即后端渲染页面时写入
 * `window.__INITIAL_STATE__.session` 的快照）为权威：
 * - 服务端注入含 id 的会话：采用服务端会话；
 * - 服务端明确未登录（null / 空对象）：返回空会话，**不使用本地残留**。
 *   否则陈旧的本地会话会让前端误判已登录（界面显示已登录），
 *   而服务端已无对应认证 cookie（所有接口返回「需要登陆态」）；
 * - 服务端未注入该字段（undefined）：回退使用本地持久化会话。
 *
 * 无论哪种来源，都以 emptySession() 为基线合并，保证 state 字段集完整。
 */
function getDefaultState(): SessionState {
  const resolution = resolveSessionSource(
    sysConfig.session as any,
    readLocalSession() as any,
  );
  return {
    ...emptySession(),
    ...(resolution.session ?? {}),
  } as SessionState;
}

export const useSessionStore = defineStore('session', {
  state: (): SessionState => getDefaultState(),
  
  getters: {
    // 是否登录
    isLoggedIn: (state) => {
      return !!state.id && !!state.userId;
    },
    
    // 获取用户名
    userName: (state) => state.user?.name || '',
    
    // 获取登录ID
    userLoginId: (state) => state.loginId,
    
    // 获取用户头像
    userAvatar: (state) => state.user?.avatar || '',
    // 登陆token
    token: (state) => state.id || '',
  },
  
  actions: {
    // 设置登录状态
    setSession(session: Partial<SessionState>) {
      if (!session || typeof session !== 'object') return;
      this.$patch((state) => {
        Object.assign(state, session); // 通过 $patch 触发响应式
      });
    },
    
    // 清除登录状态（退出登录）
    clearSession() {
      this.$patch((state) => {
        Object.assign(state, emptySession());
      });
      storage.removeItem?.(sessionStoreKey);
    },
    
    // 更新用户信息
    updateUserInfo(user: Partial<User>) {
      if(this.user) {
        this.$patch((state) => {
          // @ts-ignore
          state.user = Object.assign(state.user||{}, user);
        });
      }
    },
  },
  
  // 持久化存储配置（需要安装pinia-plugin-persistedstate）
  persist: {
    key: sessionStoreKey,
    storage: storage, // 可选sessionStorage
    //paths: ['lastDate', 'id', 'loginId', 'user', 'account', 'userId', 'iat']
  },
});
