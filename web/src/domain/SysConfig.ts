import Entity from '../base/entity';
/**
 *  系统配置Domain
 */

export interface SysConfigState {
    title?: string;
    url?: string;
    config?: {
        prefix?: string;
        permissionConfig?: {
            open: boolean;
            permissionSystemOrigin?: string;
            roleIdWhiteList?: number[];
            uniqueIdWhiteList?: string[];
            requirePermissionPaths?: string[];
            applyPermissionUrl?: string;
        };
        adapter?: string;
    };
    user?: UserInfo;
    session?: any;
    jvCommon?: {
        env?: string;
        defaultHost?: string;
        host?: string;
        ignorePath?: any[];
        ignoreHost?: string[];
        jvAppId?: number;
        main?: {
            accessKey?: string;
            loginUrl?: string;
            logoutUrl?: string;
            systemUrl?: string;
        };
        skipLoginCheck?: boolean;
        servant?: {
            objName?: string;
        };
    };
    jvSessionToken?: string;
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
    get config() {
        return this.state?.config;
    }
    get user() {
        return this.state.session?.user;
    }
    get session() {
        return this.state.session;
    }
    get jvCommon() {
        return this.state.jvCommon || {};
    }
    get isManager() {
        return this.state.isManager;
    }
}
export const sysConfig = new SysConfig(Object.assign({}, window.__INITIAL_STATE__));
