import { BaseService } from '../base/base.service';
import Account from '@fefeding/common/dist/models/account/account';
import { PageRequest, PageResponse } from '@fefeding/common/dist/models/base/pagination';
import { Response } from '@fefeding/common/dist/models/base/response';
import { User } from '@fefeding/common/dist/models/account/user';
export declare class AccountService extends BaseService {
    /**
     * 查询用户信息
     */
    queryUser(req: PageRequest): Promise<PageResponse<Account>>;
    /**
     * 创建帐号
     */
    createAccount(acc: Account): Promise<Response<Account>>;
    /**
     * 修改密码
     */
    updatePassword(account: string, oldPassword: string, newPassword: string, appId?: number): Promise<Response<boolean>>;
    /**
     * 修改用户信息
     */
    updateUser(user: User): Promise<Response<User>>;
    getByLoginId(id: number): Promise<Response<Account>>;
}
