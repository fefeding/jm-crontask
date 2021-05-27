'use strict';
import { Entity, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, Column, PrimaryColumn } from 'typeorm';

import { BaseORM } from '@jv/jv-models';


@Entity('t_task_lock')
export default class TaskLock extends BaseORM {
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
