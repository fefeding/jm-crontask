import { Provide, Inject } from '@midwayjs/core';
import { BaseService } from '@cicctencent/midwayjs-base';
import { Like } from 'typeorm';
import Account from '@cicctencent/common/dist/models/account/account';
import { PageRequest, PageResponse } from '@cicctencent/common/dist/models/base/pagination';
import { Response } from '@cicctencent/common/dist/models/base/response';
import { User } from '@cicctencent/common/dist/models/account/user';
import { UserService } from './user.service';
import UserEntity from '../model/user.entity';


@Provide()
export class AccountService extends BaseService { 
    @Inject()
    userService: UserService;

    /**
     * 是否处于本地模式（未配置基座服务）
     *
     * 本地模式下不能把请求转发到基座：baseServiceOption.url 为空时
     * axios 的 baseURL 也是空，转发路径（如 /api/account/queryUser）是相对地址，
     * axios 构造 URL 时直接抛 ERR_INVALID_URL（Invalid URL），接口直接 500。
     * 本地模式下改为直接读写本地 t_user 表。
     */
    private get isLocalMode(): boolean {
        return !this.baseServiceOption?.url;
    }

    /**
     * 查询用户信息
     */
    async queryUser(req: PageRequest) {
        if(this.isLocalMode) {
            return this.queryLocalUser(req);
        }
        const res = await this.requestBaseApi<Response<PageResponse<Account>>>('/api/account/queryUser', {
            data: req
        });
        return res;
    }
    /**
     * 创建帐号
     */
    async createAccount(acc: Account) {
        // checkManager 是异步方法，必须 await，否则 Promise 恒为真，
        // 会把所有新建帐号的请求都误判为「内置帐号」而报错
        if(await this.checkManager(acc.account)) {
            throw Error(`${acc.account} 是内置帐号，不可创建`);
        }
        acc.creator = this.ctx.currentSession?.loginId || '';
        if(acc.user) {
            acc.user.creator = acc.creator;
        }
        if(this.isLocalMode) {
            const user = await this.userService.create({
                account: acc.account as string,
                name: acc.user?.name || acc.account,
                mobile: acc.user?.mobile || '',
                email: acc.user?.email || '',
                avatar: acc.user?.avatar || '',
            } as Partial<UserEntity>, acc.password as string);
            const res = new Response<Account>();
            res.data = this.toAccount(user);
            return res;
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
        if(this.isLocalMode) {
            // 管理员可直接重置他人密码，普通用户必须校验旧密码
            const isAdmin = !!(await this.checkManager());
            await this.userService.updatePassword(account, newPassword, oldPassword, isAdmin);
            const res = new Response<boolean>();
            res.data = true;
            return res;
        }
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
        if(this.isLocalMode) {
            const updated = await this.userService.updateUser(user.id, user as unknown as Partial<UserEntity>);
            const res = new Response<User>();
            res.data = updated as unknown as User;
            return res;
        }
        const res = await this.requestBaseApi<Response<User>>('/api/account/updateUser', {
            data: {
                user
            }
        });
        return res;
    }

    // 通过loginId获取
    async getByLoginId(id: number | string) {
        if(this.isLocalMode) {
            const user = await this.findLocalUser(id);
            const res = new Response<Account>();
            if(user) {
                res.data = this.toAccount(user);
            }
            return res;
        }
        const res = await this.requestBaseApi<Response<Account>>('/api/account/getByLoginId', {
            data: {
                id
            }
        });
        return res;
    }

    /**
     * 本地模式的用户分页查询（数据源为本地 t_user 表）
     */
    private async queryLocalUser(req: PageRequest): Promise<Response<PageResponse<Account>>> {
        const query: any = req?.query || {};
        const where: any = {};

        if(query.account) where.account = query.account;
        if(query.name) where.name = Like(`%${query.name}%`);
        if(query.mobile) where.mobile = query.mobile;
        if(query.email) where.email = query.email;
        if(typeof query.enable === 'number' && query.enable > -1) where.enable = query.enable;

        // loginId 既可能是本地用户 id（数字），也可能是登录账号名（字符串）
        const loginId = query.loginId ?? query.id;
        if(loginId !== undefined && loginId !== null && loginId !== '') {
            const asNumber = Number(loginId);
            if(!Number.isNaN(asNumber)) {
                where.id = asNumber;
            }
            else {
                where.account = String(loginId);
            }
        }

        const page = req?.page || 1;
        const size = req?.size > 100 ? 100 : (req?.size || 10);

        // 关键字模糊搜索（帐号/姓名/手机/邮箱）
        let listWhere: any = where;
        if(query.filter) {
            const like = Like(`%${query.filter}%`);
            listWhere = [
                { account: like },
                { name: like },
                { mobile: like },
                { email: like },
            ];
        }

        const list = await this.userService.model.find({
            where: listWhere,
            order: { id: 'ASC' },
            skip: (page - 1) * size,
            take: size,
        });
        const total = await this.userService.model.count({ where: listWhere });

        const res = new Response<PageResponse<Account>>();
        res.data = {
            data: list.map(u => this.toAccount(u)),
            total,
            page,
        };
        return res;
    }

    /**
     * 本地模式按 id 或账号名查找用户
     */
    private async findLocalUser(id: number | string): Promise<UserEntity | null> {
        if(id === undefined || id === null || id === '') return null;
        const asNumber = Number(id);
        if(!Number.isNaN(asNumber)) {
            const user = await this.userService.model.findOneBy({ id: asNumber });
            if(user) return user;
        }
        const account = String(id);
        if(!account || account === 'NaN') return null;
        return await this.userService.getUserByAccount(account);
    }

    /**
     * 本地用户 -> 基座帐号结构（保持前端字段一致）
     */
    private toAccount(user: UserEntity): Account {
        const acc = new Account();
        acc.loginId = String(user.id);
        acc.userId = user.id;
        acc.account = user.account;
        acc.user = {
            id: user.id,
            name: user.name,
            avatar: user.avatar,
            mobile: user.mobile,
            email: user.email,
        } as unknown as User;
        return acc;
    }
}
