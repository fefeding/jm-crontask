import { App, Inject, Config } from '@midwayjs/core';
import { Application, Context } from '@midwayjs/koa';
import type { AxiosRequestConfig } from 'axios';
import * as fs from 'fs';
import * as url from 'url';
import request from '@fefeding/common/dist/models/base/request';
import response from '@fefeding/common/dist/models/base/response';
import * as TxCos from '@fefeding/common/dist/utils/txCos';
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
    
    @Config('tencentCredential')
    tencentCredentialConfig: {
        secretId: string,
        secretKey: string,
    } 
    @Config('cosFileOption')
    cosFileOption: {
            [key: string]: {
            
            /** 存储桶的名称，格式为<bucketname-appid>，例如examplebucket-1250000000 */
            Bucket: string,
            // /** 存储桶所在地域，如果有传入只返回该地域的存储桶列表 */
            Region: string,
            // /** 请求的对象键，最前面不带 / */
            Key?: string;
            // /** 发请求时带上的 Header 字段 */
            Headers?: any;
            url?: string;
        }
    }

    /**
     * 是否是管理员帐号
     * @param account 
     */
    checkManager(account: string = this.ctx.currentSession?.account?.account) {
        return account && (this.baseServiceOption.manager === account || this.baseServiceOption.manager?.includes(account));
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
        headers['x-request-id'] = this.ctx?.request_id || '';        
        headers['x-auth-token'] = this.ctx?.currentSession?.id || '';
        const ip = (this.ctx?.request?.header?.['x-client-ip'] ||
            this.ctx?.request?.header?.['x-forwarded-for'] ||
            this.ctx?.request?.ip || '').toString();
        headers['x-client-ip'] = ip;

        option.headers = headers;
        
        const res = await requestApi<T>(req, option);
        return res;
    }    
    
   
    // 生成client
    cosClient() {
        const client = TxCos.createClient({
            /** 固定密钥的 SecretId，可从{@link https://console.cloud.tencent.com/cam/capi|API密钥管理}获取 */
            SecretId: this.tencentCredentialConfig.secretId,
            /** 固定密钥的 SecretKey，可从{@link https://console.cloud.tencent.com/cam/capi|API密钥管理}获取 */
            SecretKey: this.tencentCredentialConfig.secretKey,
        });
        return client;
    }

    // 上传文件
    async uploadCosFile(key: string, filePath: string, cos='default') {    
        
        const body = fs.createReadStream(filePath);
       
        return this.uploadCosData(key, body, cos);
    }

    // 上传文件内容
    async uploadCosData(key: string, body: string|fs.ReadStream, cos='default') {        
        const option = this.cosFileOption[cos];
        
        const res = await TxCos.putObject({
            ...option,
            Key: key,
            Body: body,            
        }, this.cosClient()) as {
            /** 对象的实体标签（Entity Tag），是对象被创建时标识对象内容的信息标签，可用于检查对象的内容是否发生变化，例如"8e0b617ca298a564c3331da28dcb50df"。此头部并不一定返回对象的 MD5 值，而是根据对象上传和加密方式而有所不同 */
            ETag: string;
            /** 创建的存储桶访问地址，不带 https:// 前缀，例如 examplebucket-1250000000.cos.ap-guangzhou.myqcloud.com/images/1.jpg */
            Location: string;
            url?: string;
        };

        if(option.url) {
            res.url = (new url.URL(key, option.url)).toString();
        }

        return res;
    }
}
