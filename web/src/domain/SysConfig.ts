import Entity from '../base/entity';
import config from '@/base/config';

/**
 *  系统配置Domain
 */

export interface SysConfigState {
    title?: string;
    url?: string;
    config?: {
        prefix?: string;
        apiUrl?: string;
        adapter?: string;
    };
    sso?: any;
    user?: UserInfo;
    session?: any;
    isManager: boolean;
}

export default class SysConfig extends Entity<SysConfigState> {
    constructor(state?: any) {
        super(state);
    }

    /**
     *  获取系统标题
     */
    get title() {
        return this.state.title;
    }
    get url() {
        return this.state?.url;
    }
    get sso() {
        return this.state?.sso;
    }
    get config() {
        return this.state?.config;
    }
    get user() {
        return this.state.session?.user;
    }
    get session() {
        return this.state.session;
    }

    /**
     * 回写会话快照。
     *
     * sysConfig.session 初始来自后端注入（= 页面加载那一刻的登录态快照），
     * SPA 路由切换不会重新注入，故登录/登出成功后必须显式回写，
     * 否则路由守卫仍会按「打开页面时」的旧快照校准登录态：
     * 快照为 null 时会把刚登录成功的会话清掉（用户被反复踢回登录页），
     * 快照为已登录时会把刚登出的会话复活（界面显示已登录但接口全部报需要登陆态）。
     */
    set session(session: any) {
        this.state.session = session;
    }

    get isManager() {
        return this.state.isManager;
    }

    get rootUrl() {
        return location.origin + (this.config?.prefix || '');
    }
    
    get baseUrl() {
        if(this.sso?.baseUrl) return this.sso.baseUrl;
        else {
            return this.rootUrl;
        }
    }

    getLoginUrl(redirectUrl = location.href) {
        if(this.baseUrl === this.rootUrl) return this.baseUrl + '/login';
        return this.baseUrl + '/login?url=' + encodeURIComponent(redirectUrl);
    }

    getLogoutUrl(redirectUrl = location.href) {
        if(this.baseUrl === this.rootUrl) return this.baseUrl + '/logout';
        return this.baseUrl + '/logout?url=' + encodeURIComponent(redirectUrl);
    }
}
export const sysConfig = new SysConfig(config.state);
