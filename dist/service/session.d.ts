import { BaseService } from '../base/base.service';
import { Session, LoginByWxReq, LoginByWxRsp, LoginByAccountReq, LoginByAccountRsp } from '@fefeding/common/dist/models/account/session';
export declare class SessionService extends BaseService {
    /**
     * 根据ID获取session
     * 并判断session是否在有效期
     * @param id token唯一
     */
    getLoginSession(id: string): Promise<Session>;
    /**
     * 下线
     * @param id 需要下线的id或者session
     */
    logout(id: string): Promise<any>;
    /**
     * 登录接口
     * @param loginParams 登录参数
     * @returns
     */
    loginByWx(loginParams: LoginByWxReq): Promise<LoginByWxRsp>;
    /**
     * 帐号登陆
     * @param loginParams
     * @returns
     */
    loginByAccount(loginParams: LoginByAccountReq): Promise<LoginByAccountRsp>;
}
