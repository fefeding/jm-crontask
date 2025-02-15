import { Application, Context } from '@midwayjs/koa';
import type { AxiosRequestConfig } from 'axios';
import request from '@fefeding/common/dist/models/base/request';
import response from '@fefeding/common/dist/models/base/response';
export declare class BaseService {
    protected app: Application;
    ctx: Context;
    baseServiceOption: {
        manager?: string;
        appId: number;
        url: string;
    };
    apiOption: {
        key: string;
    };
    /**
     * 是否是管理员帐号
     * @param account
     */
    checkManager(account?: string): boolean;
    /**
     * 基础服务请求
     * @param req
     * @param option
     */
    requestBaseApi<T extends response>(req: request | string, option?: AxiosRequestConfig): Promise<T>;
}
