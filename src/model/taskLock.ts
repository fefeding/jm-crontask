'use strict';
import { Entity, PrimaryColumn, Column } from 'typeorm';
import BaseEntity from '@fefeding/common/dist/models/base/baseORM';


@Entity('t_task_lock')
export default class TaskLock extends BaseEntity {
    @PrimaryColumn({
        name: 'Fkey',
        type: 'varchar',
        length: 32,
        comment: '唯一锁'
    })
    public key: string;

    @Column({
        name: 'Fname',
        type: 'varchar',
        length: 64,
        comment: '锁名称'
    })
    public name: string = '';
}



export { TaskLock };
