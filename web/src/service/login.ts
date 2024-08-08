import { request } from './base';
import type { Session } from '@fefeding/common/dist/models/account/session';

// 查询学校列表
export async function login(account: string, password: string) {
    const res = await request('/api/session/loginByAccount', {
        account,
        password,
    });
    if(res?.ret === 0) {
        if(window.__INITIAL_STATE__) window.__INITIAL_STATE__.session = res.data;
    }
    return res;
}

// 当前登陆的session
export function getSession(): Session | null {
    return window.__INITIAL_STATE__?.session || null;
}