'use strict';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import BaseEntity from '@fefeding/common/dist/models/base/baseORM';

import {TaskState, TaskTimeSize} from './taskConst';



@Entity('t_task_config')
export default class TaskConfig extends BaseEntity {
    @PrimaryGeneratedColumn({
        name: 'Fid',
        comment: '数据唯一健'
    })
    public id: number;

    @Column({
        name: 'Fname',
        type: 'varchar',
        length: 64,
        comment: '任务名称'
    })
    public name: string = '';

    @Column({
        name: 'Fdescription',
        type: 'varchar',
        default: '',
        length: 128,
        comment: '说明文案'
    })
    public description: string = '';

    @Column({
        name: 'Fscript',
        type: 'text',
        comment: '运行脚本'
    })
    public script: string = '';

    @Column({
        name: 'Ftime_size',
        type: 'smallint',
        default: 0,
        comment: '任务执行时间单位'
    })
    public timeSize: TaskTimeSize = TaskTimeSize.single;

    @Column({
        name: 'Fstate',
        type: 'smallint',
        default: TaskState.init,
        comment: '任务执行时间单位'
    })
    public state: TaskState = TaskState.init;

    /**
     * 当为单次执行时，就是一个具体的时间，  
     * 当为每天时，这里可以指定具体几点几分几秒执行
     * 当为每秒、分、时。这个值不采用，循环执行
     */
    @Column({
        name: 'Ftime_value',
        type: 'varchar',
        default: '',
        comment: '执行的具体时间，格式（YYYY-MM-DD hh:mm:ss）'
    })
    public timeValue: string = '';

    @Column({
        name: 'Flast_run_time',
        type: 'varchar',
        default: '',
        comment: '最后一次执行时间，格式（YYYY-MM-DD hh:mm:ss）'
    })
    public lastRunTime: string = '';

    /**
     * 关注人员工ID  id|id|,
     */
    @Column({
        name: 'Fwatcher',
        type: 'varchar',
        length: 64,
        default: '',
        comment: '任务关注人，staffid|staffid|...'
    })
    public watcher: string = '';
}



export { TaskConfig };
