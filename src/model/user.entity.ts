import BaseEntity from '@fefeding/common/dist/models/base/baseORM';
import { EEnable, } from '@fefeding/common/dist/models/account/user';

import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('t_user')
export default class User extends BaseEntity {
    @PrimaryGeneratedColumn({
        name: 'id',
        type: 'int',
        comment: '自增主键',
    })
    public id: number = 0;

    @Column({
        name: 'Fname',
        type: 'varchar',
        comment: '名称',
        default: '',
    })
    public name: string = '';

    @Column({
        name: 'Faccount',
        type: 'varchar',
        default: '',
        length: 64,
        comment: '帐号',
    })
    public account: string;

    @Column({
        name: 'Frole',
        type: 'varchar',
        comment: '角色',
        length: 32,
        default: 'user',
    })
    public role: 'user'|'admin' = 'user';

    @Column({
        name: 'Fpassword',
        type: 'varchar',
        length: 64,
        default: '',
        comment: '帐号密码，用md5保存',
    })
    public password: string = '';

    @Column({
        name: 'Fmobile',
        type: 'varchar',
        comment: '手机号码',
        length: 32,
        default: '',
    })
    public mobile = '';

    @Column({
        name: 'Femail',
        type: 'varchar',
        comment: '邮箱',
        length: 32,
        default: '',
    })
    public email = '';

    @Column({
        name: 'Favatar',
        type: 'varchar',
        comment: '头像url',
        length: 256,
        default: '',
    })
    public avatar = '';

    @Column({
        name: 'Fenable',
        type: 'smallint',
        default: 1,
        comment:
            '成员启用状态。1表示启用的成员，0表示被禁用。注意，服务商调用接口不会返回此字段',
    })
    public enable: EEnable = EEnable.ENABLE;
}
