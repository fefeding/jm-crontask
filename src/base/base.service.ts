import { App, Inject, Config } from '@midwayjs/core';
import { Application, Context } from '@midwayjs/koa';
import type { AxiosRequestConfig } from 'axios';
import request from '@fefeding/common/dist/models/base/request';
import response from '@fefeding/common/dist/models/base/response';
import api from '@fefeding/common/dist/utils/api';
import { requestApi } from '../lib/request';

export class BaseService {
    @App()
    protected app: Application;

    @Inject()
    public ctx: Context;

    @Config('baseService')
    baseServiceOption: {
        manager?: string,
        appId: number,
        url: string
    }  
    // 登陆态验证配置
    @Config('apiOption')
    apiOption: {
        key: string;
    };  

    /**
     * 是否是管理员帐号
     * @param account 
     */
    checkManager(account: string = this.ctx.currentSession?.account?.account) {
        return account && this.baseServiceOption.manager === account;
    }

    /**
     * 基础服务请求
     * @param req 
     * @param option 
     */
    async requestBaseApi<T extends response>(req: request|string, option?: AxiosRequestConfig): Promise<T> {
        option = {
            ...option,
            method: 'POST',
            baseURL: this.baseServiceOption.url,
        } as AxiosRequestConfig;

        const headers = option.headers || {};
        if(this.apiOption?.key) {
            const thisToken = api.createApiToken(this.apiOption.key);
            headers['x-api-token'] = thisToken.sign;
            headers['x-api-timestamp'] = thisToken.timestamp;

            /*if(typeof req === 'object') {
                req.api_token = thisToken.sign;
                req.timestamp = thisToken.timestamp;                
            }*/
        }
        headers['x-request-id'] = this.ctx.request_id;        
        headers['x-auth-token'] = this.ctx.currentSession?.id || '';

        option.headers = headers;
        
        const res = await requestApi<T>(req, option);
        return res;
    }
}
