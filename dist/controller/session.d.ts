import { BaseController } from '../base/base.controller';
import { SessionService } from '../service/session';
export declare class SessionController extends BaseController {
    sessionService: SessionService;
    loginByWx(loginParams: any): Promise<import("@fefeding/common/dist/models/account/session").LoginByWxRsp | {
        id: string;
        code?: string;
        loginId: string;
        userId?: number;
        user?: import("@fefeding/common/dist/models/account/user").default;
        account?: import("@fefeding/common/dist/models/account/account").default;
        appId?: number;
        status?: import("@fefeding/common/dist/models/base/enumType").EStatus;
        lastDate: Date;
        valid: import("@fefeding/common/dist/models/base/enumType").EValid;
        creator: string;
        updater: string;
        createTime: Date;
        modifyTime: Date;
    }>;
    loginByAccount(loginParams: any): Promise<import("@fefeding/common/dist/models/account/session").LoginByAccountRsp | {
        id: string;
        code?: string;
        loginId: string;
        userId?: number;
        user?: import("@fefeding/common/dist/models/account/user").default;
        account?: import("@fefeding/common/dist/models/account/account").default;
        appId?: number;
        status?: import("@fefeding/common/dist/models/base/enumType").EStatus;
        lastDate: Date;
        valid: import("@fefeding/common/dist/models/base/enumType").EValid;
        creator: string;
        updater: string;
        createTime: Date;
        modifyTime: Date;
    }>;
}
