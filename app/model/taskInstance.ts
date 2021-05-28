'use strict';
import { Entity, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, Column, PrimaryColumn, Index, OneToOne, JoinColumn } from 'typeorm';

import { BaseORM } from './baseORM';
import TaskConfigORM from './taskConfig';
import {TaskStatus} from './taskConst';


@Entity('t_task_instance')
export default class TaskInstance extends BaseORM {
    @PrimaryGeneratedColumn({
        name: 'Fid',
        comment: '数据唯一健'
    })
    public id: number;

    @Column({
        name: 'Ftask_id',
        type: 'int',
        comment: '关联的任务ID'
    })
    @Index()
    public taskId: number = 0;

    @Column({
        name: 'Fexec_server',
        type: 'varchar',
        length: 64,
        comment: '运行服务器',
        nullable: true
    })
    public execServer: string = '';    

    @Column({
        name: 'Fexec_start_time',
        type: 'varchar',
        length: 32,
        comment: '运行起始时间',
        nullable: true
    })
    public execStartTime: string = '';    

    @Column({
        name: 'Fexec_end_time',
        type: 'varchar',
        length: 32,
        comment: '运行结束时间',
        nullable: true
    })
    public execEndTime: string = '';

    @Column({
        name: 'Fstatus',
        type: 'smallint',   
        default: TaskStatus.init,
        comment: '任务状态'
    })
    @Index()
    public status: TaskStatus = TaskStatus.init;    

    @Column({
        name: 'Flog',
        type: 'longtext',
        comment: '运行日志',
        nullable: true
    })
    public log: string = '';
}



export { TaskInstance };
