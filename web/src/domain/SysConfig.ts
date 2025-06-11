import Entity from '../base/entity';
/**
 *  系统配置Domain
 */

export interface SysConfigState {
    title?: string;
    url?: string;
    config?: {
        prefix?: string;
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
    get isManager() {
        return this.state.isManager;
    }
}
export const sysConfig = new SysConfig(Object.assign({}, window.__INITIAL_STATE__));
