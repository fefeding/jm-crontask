import { Inject, Controller, All, Provide, Body, Query } from '@midwayjs/core';
import { BaseController, decorators } from '@cicctencent/midwayjs-base';
import { AccountService } from '../service/account.service';
import { PageRequest } from '@fefeding/common/dist/models/base/pagination';
import Account from '@fefeding/common/dist/models/account/account';
import User from '@fefeding/common/dist/models/account/user';

@Provide()
@Controller('/api/account')
export class AccountController extends BaseController {
    @Inject()
    accountService: AccountService;

    @All('/queryUser')
    @decorators.checkLogin(true)// 需要登陆态的接口
    async queryUser(@Body() queryInfo: PageRequest) {
        if(!this.accountService.checkManager()) {
            throw Error('没有查询权限');
        }
        if(queryInfo.size > 100) queryInfo.size = 100;
        const res = await this.accountService.queryUser(queryInfo);        
        return res;
    }

    @All('/queryUserName')
    @decorators.checkLogin(true)// 需要登陆态的接口
    async queryUserName(@Body() queryInfo: PageRequest) {
        const res = await this.accountService.queryUser(queryInfo);   
        const names = []; 
        if(res.data?.data) {
            for(const u of res.data.data) {
                names.push({
                    name: u.user?.name || '',
                    account: u.account || '',
                    loginId: u.loginId,
                    userId: u.userId,
                });
            }
        }    
        return names;
    }

    @All('/getByLoginId')
    @decorators.checkLogin(true)// 需要登陆态的接口
    async getByLoginId(@Query('id') id: number) {
        const res = await this.accountService.getByLoginId(id); 
        if(res?.data) {
            return {
                loginId: id,
                userId: res.data.userId,
                account: res.data.account,
            }
        }
        return res;
    }

    /**
     * 创建帐号
     */
    @All('/createAccount')
    @decorators.checkLogin(true)// 需要登陆态的接口
    async createAccount(@Body() acc: Account) {
        if(!this.accountService.checkManager()) {
            throw Error('没有权限');
        }
        const res = await this.accountService.createAccount(acc);
        return res;
    }

    /**
     * 修改密码
     */
    @All('/updatePassword')
    @decorators.checkLogin(true)// 需要登陆态的接口
    async updatePassword(@Body('account') account: string, @Body('oldPassword') oldPassword: string, @Body('newPassword') newPassword: string) {
        const res = await this.accountService.updatePassword(account, oldPassword, newPassword);
        return res;
    }

    /**
     * 修改用户信息
     */
    @All('/updateUser')
    @decorators.checkLogin(true)// 需要登陆态的接口
    async updateUser(@Body() user: User) {    
        if(!this.accountService.checkManager()) {
            throw Error('没有权限');
        }
        const res = await this.accountService.updateUser(user);
        return res;
    }
}
