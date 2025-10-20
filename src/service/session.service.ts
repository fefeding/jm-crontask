import { Provide, Scope, ScopeEnum, Config, Inject } from '@midwayjs/core';
import { ISessionService, TencentService } from '@cicctencent/midwayjs-base';
import { Session, GetLoginSessionReq, GetLoginSessionRes, LogoutReq, LogoutRes, LoginByWxReq, LoginByWxRsp, LoginByAccountReq, LoginByAccountRsp } from '@fefeding/common/dist/models/account/session';

@Provide('session:service')
@Scope(ScopeEnum.Request, { allowDowngrade: true })
export class SessionService extends ISessionService { 
    @Config('loginOption')
    loginOption: any;

    @Inject()
    tencentService: TencentService;

    /**
     * 根据ID获取session
     * 并判断session是否在有效期
     * @param id token唯一
     */
    async getLoginSession(id: string): Promise<Session> {
        const req = new GetLoginSessionReq();
        req.id = id;
        const res = await this.requestBaseApi<GetLoginSessionRes>(req);
        console.log(res);
        return res?.data || null;
    }
    /**
     * 下线
     * @param id 需要下线的id或者session
     */
    async logout(id: string): Promise<any> {
        const req = new LogoutReq();
        req.id = id;
        const res = await this.requestBaseApi<LogoutRes>(req);
        this.ctx.currentSession = null;
        return res;
    }

    /**
     * 登录接口
     * @param loginParams 登录参数
     * @returns 
     */
    async loginByWx(loginParams: LoginByWxReq) {
        const req = new LoginByWxReq();
        req.fromJSON(loginParams);
        const res = await this.requestBaseApi<LoginByWxRsp>(req);
        return res;
    }

    /**
     * 帐号登陆
     * @param loginParams 
     * @returns 
     */
    async loginByAccount(loginParams: LoginByAccountReq) {
        loginParams.appId = '0';//this.baseServiceOption.appId?.toString() || '0';
        
        const req = new LoginByAccountReq();
        req.fromJSON(loginParams);
        const res = await this.requestBaseApi<LoginByAccountRsp>(req);
        return res;
    }

    /**
     * 用临时码登陆
     * @param code 登陆临时码
     * @returns 
     */
    async loginByCode(code: string) {
        const res = await this.requestBaseApi('/api/session/loginByAuthCode', {
            data: {
                code
            }
        });
        console.log(res);
        return res?.data || null;
    }
}
