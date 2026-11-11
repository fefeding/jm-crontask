import { Provide } from '@midwayjs/core';
import { BaseService } from '@cicctencent/midwayjs-base';
import Account from '@cicctencent/common/dist/models/account/account';
import { PageRequest, PageResponse } from '@cicctencent/common/dist/models/base/pagination';
import { Response } from '@cicctencent/common/dist/models/base/response';
import { User } from '@cicctencent/common/dist/models/account/user';


@Provide()
export class AccountService extends BaseService { 

    /**
     * 查询用户信息
     */
    async queryUser(req: PageRequest) {        
        const res = await this.requestBaseApi<Response<PageResponse<Account>>>('/api/account/queryUser', {
            data: req
        });
        return res;
    }
    /**
     * 创建帐号
     */
    async createAccount(acc: Account) {
        if(this.checkManager(acc.account)) {
            throw Error(`${acc.account} 是内置帐号，不可创建`);
        }
        acc.creator = this.ctx.currentSession?.loginId || '';
        if(acc.user) {
            acc.user.creator = acc.creator;
        }
        const res = await this.requestBaseApi<Response<Account>>('/api/account/createAccount', {
            data: acc
        });
        return res;
    }

    /**
     * 修改密码
     */
    async updatePassword(account: string, oldPassword: string, newPassword: string, appId: number = this.baseServiceOption?.appId) {
        const res = await this.requestBaseApi<Response<boolean>>('/api/account/updatePassword', {
            data: {
                account,
                oldPassword,
                newPassword,
                appId
            }
        });
        return res;
    }

    /**
     * 修改用户信息
     */
    async updateUser(user: User) {        
        user.updater = this.ctx.currentSession?.loginId || '';
        const res = await this.requestBaseApi<Response<User>>('/api/account/updateUser', {
            data: {
                user
            }
        });
        return res;
    }

    // 通过loginId获取
    async getByLoginId(id: number) {
        const res = await this.requestBaseApi<Response<Account>>('/api/account/getByLoginId', {
            data: {
                id
            }
        });
        return res;
    }
}
