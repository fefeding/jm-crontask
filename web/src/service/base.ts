import { requestApi } from '@fefeding/common/dist/utils/axios';
//import { Request } from '@fefeding/common/dist/models/base/request';
import type { Response } from '@fefeding/common/dist/models/base/response';
import type { AxiosRequestConfig } from 'axios';
import config from '../base/config';

export function getRequestUrl(api: string) {
    if(/^(http(s)?:)?\/\//.test(api)) return api;
    return `${location.protocol}//${location.hostname}:${location.port}${config.prefix}${api}`;
}
// 请求服务
export async function request<T extends Response>(url: string, data?: any, option?: AxiosRequestConfig) {
    url = getRequestUrl(url);
    const res = await requestApi<T>(url, {
        data,
        method: 'POST',
        ...option
    });
    return res;
}