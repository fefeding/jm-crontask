//import { requestApi } from '@fefeding/common/dist/utils/axios';
//import { Request } from '@fefeding/common/dist/models/base/request';
import Axios from 'axios';
import type { AxiosRequestConfig } from 'axios';
import config from '../base/config';

const axios = Axios.create();

export function getRequestUrl(api: string) {
    if(/^(http(s)?:)?\/\//.test(api)) return api;
    return `${location.protocol}//${location.hostname}:${location.port}${config.prefix}${api}`;
}
// 请求服务
export async function request<T = any>(url: string, data?: any, option?: AxiosRequestConfig) {
    url = getRequestUrl(url);
    option = {
        method: 'POST',
        ...option
    };
    let res;
    if(option.method === 'GET' || option.method === 'get') {
        res = await axios.get(url, {
            ...option,
            params: data||{}
        });
    }
    else {
        res = await axios.post(url, data, option);
    }
    if(res?.data.ret === 50001) {
        console.error('登陆态失效，请重新登陆后再试');
        alert('登陆态已失效，请重新登陆');
        location.reload();
    }
    if(res.status !== 200) {
        throw {
            ret: res.status,
            msg: res.statusText,
        };
    }
    return res?.data as T;
}