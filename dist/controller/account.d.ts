import { BaseController } from '../base/base.controller';
import { AccountService } from '../service/account';
import { PageRequest } from '@fefeding/common/dist/models/base/pagination';
import Account from '@fefeding/common/dist/models/account/account';
import User from '@fefeding/common/dist/models/account/user';
export declare class AccountController extends BaseController {
    accountService: AccountService;
    queryUser(queryInfo: PageRequest): Promise<import("@fefeding/common/dist/models/base/pagination").PageResponse<Account>>;
    queryUserName(queryInfo: PageRequest): Promise<any[]>;
    getByLoginId(id: number): Promise<import("@fefeding/common/dist/models/base/response").default<Account> | {
        loginId: number;
        userId: number;
        account: string;
    }>;
    /**
     * 创建帐号
     */
    createAccount(acc: Account): Promise<import("@fefeding/common/dist/models/base/response").default<Account>>;
    /**
     * 修改密码
     */
    updatePassword(account: string, oldPassword: string, newPassword: string): Promise<import("@fefeding/common/dist/models/base/response").default<boolean>>;
    /**
     * 修改用户信息
     */
    updateUser(user: User): Promise<import("@fefeding/common/dist/models/base/response").default<User>>;
}
