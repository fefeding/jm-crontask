'use strict';

import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import BaseEntity from '@cicctencent/common/dist/models/base/baseORM';
import { TaskStatus } from './taskConst';

@Entity('t_task_instance')
export default class TaskInstance extends BaseEntity {
    @PrimaryGeneratedColumn({
        name: 'Fid',
        comment: '数据唯一健',
    })
    public id: number;

    @Column({
        name: 'Ftask_id',
        type: 'int',
        comment: '关联的任务ID',
    })
    public taskId = 0;

    @Column({
        name: 'Fexec_server',
        type: 'varchar',
        length: 64,
        comment: '运行服务器',
        nullable: true,
    })
    public execServer = '';

    @Column({
        name: 'Fexec_start_time',
        type: 'varchar',
        length: 32,
        comment: '运行起始时间',
        nullable: true,
    })
    public execStartTime = '';

    @Column({
        name: 'Fexec_end_time',
        type: 'varchar',
        length: 32,
        comment: '运行结束时间',
        nullable: true,
    })
    public execEndTime = '';

    @Column({
        name: 'Fstatus',
        type: 'smallint',
        default: TaskStatus.init,
        comment: '任务状态',
    })
    public status: TaskStatus = TaskStatus.init;

    @Column({
        name: 'Flog',
        type: 'longtext',
        comment: '运行日志',
        nullable: true,
    })
    public log = '';

    /**
     * 本次执行耗时，单位毫秒
     */
    @Column({
        name: 'Fduration',
        type: 'int',
        default: 0,
        comment: '执行耗时，单位毫秒',
    })
    public duration = 0;

    /**
     * 进程退出码，0 表示成功
     */
    @Column({
        name: 'Fexit_code',
        type: 'int',
        default: 0,
        comment: '进程退出码',
    })
    public exitCode = 0;

    /**
     * 已重试次数
     */
    @Column({
        name: 'Fretry_count',
        type: 'int',
        default: 0,
        comment: '已重试次数',
    })
    public retryCount = 0;

    /**
     * 日志落盘相对路径
     */
    @Column({
        name: 'Flog_path',
        type: 'varchar',
        default: '',
        length: 512,
        comment: '日志落盘相对路径',
    })
    public logPath = '';

    /**
     * 执行产物备份相对路径
     */
    @Column({
        name: 'Fpublish_path',
        type: 'varchar',
        default: '',
        length: 512,
        comment: '产物备份相对路径',
    })
    public publishPath = '';

    /**
     * 触发方式：0=定时触发 1=手动触发
     */
    @Column({
        name: 'Ftrigger_type',
        type: 'smallint',
        default: 0,
        comment: '触发方式：0=定时 1=手动',
    })
    public triggerType = 0;

    /**
     * 子进程 pid，用于超时强制回收
     */
    @Column({
        name: 'Fpid',
        type: 'int',
        default: 0,
        comment: '子进程pid',
    })
    public pid = 0;

    /**
     * 下次重试时间，为空表示不重试
     */
    @Column({
        name: 'Fnext_retry_time',
        type: 'varchar',
        length: 32,
        default: '',
        comment: '下次重试时间',
    })
    public nextRetryTime = '';
}

export { TaskInstance };
