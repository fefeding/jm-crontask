import Entity from '../base/entity';
import { merge } from 'lodash-es';
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
}

export default class SysConfig extends Entity<SysConfigState> {
    constructor(state?: SysConfigState) {
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
        return this.state.user;
    }
    get jvCommon() {
        return this.state.jvCommon || {};
    }
}
export const sysConfig = new SysConfig(merge({}, window.__INITIAL_STATE__));
