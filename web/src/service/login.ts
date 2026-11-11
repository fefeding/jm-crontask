import { sysConfig } from '@/domain/SysConfig';
import { request } from './base';
import { type RouteLocationNormalizedGeneric } from 'vue-router';
import Cookies from 'js-cookie';
import { useSessionStore } from '@/stores/session';
import { decodeJwtPayload } from '@/utils/jwt';
import { decideSessionDecision } from '@/utils/login-policy';


/**
 * 从后端返回的登录结果中还原会话对象。
 *
 * 后端本地校验模式下 `loginByAccount` 返回的是 **token 字符串**
 * （`Bearer xxx.yyy.zzz`），而非会话对象；对接账号服务时返回的才是会话对象。
 * 两种情况都要归一成会话对象：
 * - 字符串 → 解析 JWT 载荷（载荷本身就是 session，见后端 encodeJWT(session, key)）；
 * - 对象 → 直接使用。
 *
 * @param data 后端返回的 data 字段
 * @returns 会话对象；无法还原时返回 null
 */
function toSession(data: any): any | null {
    if (!data) return null;
    if (typeof data === 'string') {
        const payload = decodeJwtPayload(data);
        // JWT 载荷里至少要有 id 才能构成有效会话
        return payload && payload.id ? payload : null;
    }
    if (typeof data === 'object' && data.id) return data;
    return null;
}

// 登陆
export async function login(account: string, password: string) {
    const res = await request('/api/session/loginByAccount', {
        account,
        password,
    });
    if(res?.ret === 0) {
        const sessionStorre = useSessionStore();
        const session = toSession(res.data);
        if (session) {
            sessionStorre.setSession(session);
            // 回写会话快照：快照仍是「打开页面时」的旧值（未登录）时，
            // 路由守卫会在切页时把刚建立的会话清掉 → 用户被反复踢回登录页。
            sysConfig.session = session;
        }
    }
    return res;
}

export async function getLoginSession(token: string) {
    const res = await request('/api/session/getLoginSession', {
        token
    });
    return res;
}

export async function loginByCode(authCode: string,) {
    const res = await request('/api/session/loginByCode', {
        authCode,
    });
    return res;
}

export async function logout() {
    const sessionStorre = useSessionStore();
    sessionStorre.clearSession();
    // 快照同步失效：登出后快照仍是「登出前」的已登录会话，
    // 路由切换时会被它复活（界面显示已登录，但服务端 cookie 已清空，
    // 所有接口返回「需要登陆态」）。
    sysConfig.session = null;
    Cookies.remove('token');
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
    const sessionStore = useSessionStore();
    if(!sessionStore.isLoggedIn) return await redirectToLogin();    
    return sessionStore;
}

/** 去掉地址栏中的一次性授权码，避免刷新/后退时重复使用 */
function stripAuthCodeFromUrl() {
    try {
        const currentUrl = new URL(window.location.href);
        if(!currentUrl.searchParams.get('auth_code')) return;
        currentUrl.searchParams.delete('auth_code');
        window.history.replaceState({}, '', currentUrl.toString());
    }
    catch(e) {
        console.error(e);
    }
}

/**
 * 校准登录态，返回当前是否已登录。
 *
 * 登录态判定不能只看「页面加载时的服务端快照」（sysConfig.session）：
 * 快照是 SPA 生命周期内的静态值，而登录可能发生在本次页面加载之后
 * （账号登录、SSO 以 auth_code 直接回跳前端、由前端换取会话），
 * 此时快照仍是「打开页面时未登录」的旧记录。
 * 若直接按它清空运行期会话，就会出现「旧记录覆盖新状态」：
 * 用户明明登录成功，路由切换时却被当成未登录 → 跳登录 → 再跳 …（死循环）。
 *
 * 故按 decideSessionDecision 的四态决策处理：
 * - use-server    快照有效 → 采信服务端；
 * - use-runtime   服务端未提供信号 → 回退运行期；
 * - verify-server 快照与运行期矛盾 → 不盲清，保留运行期会话；
 * - clear         确实未登录 → 清理本地残留。
 */
export async function initLoginState(to?: RouteLocationNormalizedGeneric) {
    const sessionStore = useSessionStore();

    const decision = decideSessionDecision({
        snapshot: sysConfig.session as any,
        runtimeLoggedIn: sessionStore.isLoggedIn,
    });

    if (decision === 'use-server') {
        const session = toSession(sysConfig.session);
        if (session) sessionStore.setSession(session);
        stripAuthCodeFromUrl();
        return true;
    }

    if (decision === 'use-runtime') {
        stripAuthCodeFromUrl();
        return true;
    }

    if (decision === 'verify-server') {
        // 快照说未登录、运行期说已登录：不盲清。
        //
        // 与模板的差异：模板在此处会调用后端权威接口核实，核实失败即清空会话。
        // 本项目的会话核实接口（/api/session/getLoginSession）依赖外部账号服务，
        // 该服务不可用时接口会报错/超时，若据此清空会话，就会把刚登录成功的
        // 用户踢回登录页（本地无账号服务时必现）。
        // 故此处只做保守处理：保留运行期会话，交由服务端接口的「需要登陆态」响应
        // 触发统一的重新登录流程。
        stripAuthCodeFromUrl();
        return true;
    }

    // decision === 'clear'：明确未登录，清掉本地残留
    sessionStore.clearSession();

    try {
        // 获取当前 URL 的查询参数
        const currentUrl = new URL(window.location.href);
        const authCode = currentUrl.searchParams.get('auth_code');
        // 授权码是一次性的：无论换会话成功与否都要从地址栏摘掉，
        // 否则刷新 / 转发 / 后退时都会拿同一个已失效的 code 去换取会话。
        if (authCode) {
            const res = await loginByCode(authCode);

            if(res && res.ret === 0) {
                const session = toSession(res.data);
                if (session) {
                    sessionStore.setSession(session);
                    // 回写快照：否则本次页面加载时的「未登录」快照会在下次路由切换时
                    // 把刚换到的会话清掉，用户被反复踢回登录页。
                    sysConfig.session = session;
                    Cookies.set('token', res.data.id ?? session.id);
                }
            }
            stripAuthCodeFromUrl();
        }
    }
    catch(e) {
        console.error(e);
    }
    return sessionStore.isLoggedIn;
}
