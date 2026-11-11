import { Provide, Scope, ScopeEnum, Config, Inject } from '@midwayjs/core';
import { ISessionService, TencentService, utils } from '@cicctencent/midwayjs-base';
import { Session, GetLoginSessionReq, GetLoginSessionRes, LogoutReq, LogoutRes, LoginByWxReq, LoginByWxRsp, LoginByAccountReq, LoginByAccountRsp } from '@cicctencent/common/dist/models/account/session';

/**
 * 本地模式（未配置基座服务）下签发与校验 JWT 使用的默认密钥。
 * 与 config.default.ts 的 session.secretKey 保持一致，二者必须相同。
 */
export const LOCAL_SESSION_SECRET_KEY = 'fefeding';

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
        // 本地模式（未配置基座服务）不能转发到基座：
        // baseServiceOption.url 为空时 axios 的 baseURL 也是空，
        // 转发路径 /api/session/getLoginSession 是相对地址，
        // axios 构造 URL 时直接抛 ERR_INVALID_URL（Invalid URL），
        // 鉴权随之判定失败 —— 所有业务接口都会返回 Invalid URL 而取不到数据。
        // 本地模式改为本地校验会话。
        if(!this.baseServiceOption?.url) {
            return this.resolveLocalSession();
        }
        const req = new GetLoginSessionReq();
        req.id = id;
        const res = await this.requestBaseApi<GetLoginSessionRes>(req);
        return res?.data || null;
    }

    /**
     * 本地模式的会话校验：解析请求携带的 Bearer JWT。
     *
     * 本地登录（loginByAccount 的本地分支）写入 cookie 的就是 Bearer JWT，
     * 其中携带了完整会话（id / userId / user / account）。
     * 前端在 x-auth-token 头里带的是会话 id —— 那是基座模式用来向基座查会话的，
     * 本地模式没有基座可查，只能以 httpOnly cookie 中的 JWT 为准。
     *
     * @returns 解析成功返回会话；无法解析返回 null（由 AuthGuard 判定未登录）
     */
    private resolveLocalSession(): Session | null {
        const secretKey = this.sessionOption?.secretKey || LOCAL_SESSION_SECRET_KEY;
        const candidates = [
            this.ctx?.cookies?.get('token', { signed: false }),
            this.ctx?.request?.header?.['authorization'],
        ].filter((v): v is string => typeof v === 'string' && v.startsWith('Bearer '));

        for(const raw of candidates) {
            const jwtData = utils.decodeJWT(raw.replace('Bearer ', ''), secretKey);
            if(jwtData?.id) {
                return jwtData as Session;
            }
        }
        return null;
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
