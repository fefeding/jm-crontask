
import type { PageResponse } from '@fefeding/common/dist/models/base/pagination';
import { request } from './base';
import type Account from '@fefeding/common/dist/models/account/account';
import type User from '@fefeding/common/dist/models/account/user';

// 查询
export async function queryUser(queryInfo: any) {
    const res = await request<PageResponse<Account>>('/api/account/queryUser', queryInfo);
    return res;
}

export async function queryUserName(queryInfo: any) {
    const res = await request('/api/account/queryUserName', queryInfo);
    return res;
}

// 新增
export async function create(acc: any) {
    const res = await request('/api/account/createAccount', acc);
    return res;
}

// 修改
export async function update(acc: User) {
    const res = await request('/api/account/updateUser', acc);
    return res;
}

// 修改密码
export async function updatePassword(account: string, newPassword: string, oldPassword: string) {
    const res = await request('/api/account/updatePassword', {
        account,
        newPassword,
        oldPassword,
    });
    return res;
}

export async function getByLoginId(id: number) {
    const res = await request('/api/account/getByLoginId', {
        id
    }, {
        method: 'GET'
    });
    return res;
}

// 删除
export async function remove(id: number) {
    const res = await request('/api/account/delete', {
        id
    });
    return res;
}