import { sysConfig } from '@/domain/SysConfig';
import { request } from './base';
import { useSessionStore } from '@/stores/session';



// 登陆
export async function login(account: string, password: string) {
    const res = await request('/api/session/loginByAccount', {
        account,
        password,
    });
    if(res?.ret === 0) {
        const sessionStorre = useSessionStore();
        sessionStorre.setSession(res.data);
    }
    return res;
}

export async function logout() {
    const sessionStorre = useSessionStore();
    sessionStorre.clearSession();
    const res = await request('/api/session/logout');
    return res;
}

export function getLoginUrl(redirectUrl = location.href) {
    return sysConfig.getLoginUrl(redirectUrl);
}

export function getLogoutUrl(redirectUrl = location.href) {
    return sysConfig.getLogoutUrl(redirectUrl);
}

export async function redirectToLogin() {
    const url = getLoginUrl();
    location.replace(url);
    return false;
}

// 如果没有登陆则跳去
export async function checkLogin() {
    const sessionStorre = useSessionStore();
    if(!sessionStorre.isLoggedIn) return await redirectToLogin();
    
    return sessionStorre;
}