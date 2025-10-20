
import config from '@/base/config';
import * as request from './request';

const baseUrl = 'https://restapi.amap.com/v3';

const requestAmap = async (url: string, data?: any, method = 'get') => {
    const res = await request.request(url, data, {
        baseURL: baseUrl,
        params: {
            // @ts-ignore
            key: config.amap.webservice
        },
        method,
    });
    return res;
}

// 地理编码
export const geocodeGeo = async (address: string) => {
    const res = await requestAmap('/geocode/geo', {
        address,
        output: 'json',
    });
    return res.data;
}