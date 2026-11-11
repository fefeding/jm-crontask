
import * as requestHelper from '@/utils/request';
import type { AxiosRequestConfig } from 'axios';
import * as eventBus from '../base/eventBus';
import config from '../base/config';

export function getRequestUrl(api: string) {
    if(/^(http(s)?:)?\/\//.test(api)) return api;
    const apiUrl = config.apiUrl || `${location.protocol}//${location.hostname}${[80,443].includes(Number(location.port))?'':(':'+location.port)}`;
    return `${apiUrl.trim()}${config.prefix}${api}`;
}

/**
 * 接口统一响应结构
 *
 * request<T> 返回的是后端的完整响应体（信封），
 * 因此调用方应写成 request<ApiResult<具体类型>>() 才能拿到正确的类型。
 */
export interface ApiResult<T = any> {
    /** 0 表示成功 */
    ret: number;
    /** 业务数据 */
    data: T;
    /** 错误信息 */
    msg?: string;
}

export async function requestServer(url: string|AxiosRequestConfig, data?: any, option?: AxiosRequestConfig) {
    if(typeof url === 'object') {
        option = url;
        url = url.url?.toString() || '';
    }
    url = getRequestUrl(url);
    const res = await requestHelper.request(url, data, option);
    return res;
}

// 请求服务
export async function request<T = any>(url: string|AxiosRequestConfig, data?: any, option?: AxiosRequestConfig) { 
    const res = await requestServer(url, data, option);
    // 部分接口（如 /api/session/logout）成功时返回空响应体，
    // 此处不能用 res.data.ret 直接解引用，否则空 body 会抛 TypeError，
    // 连带中断调用方后续逻辑（如登出后的跳转）。
    const body = res?.data;
    if(body?.ret === 50001) {
        console.error('登陆态失效，请重新登陆后再试');
        body.msg = '登陆态失效，请重新登陆后再试';
        eventBus.publish(eventBus.AUTHTIMEOUT, { message: body.msg });
    }
    if(res.status !== 200) {
        // 保留后端返回的 ret/msg，避免调用方只能拿到 statusText（如「系统错误」）
        throw {
            ret: body?.ret ?? res.status,
            msg: body?.msg || res.statusText || `请求失败(${res.status})`,
            status: res.status,
        };
    }
    return body as T;
}

// 请求管理端接口代理
export async function requestBaseServerApi(api: string, data?: any): Promise<any> {
    return request('/admin/requestBaseServer', {
        api,
        data,
    });
}