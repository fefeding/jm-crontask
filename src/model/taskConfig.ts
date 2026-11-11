'use strict';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import BaseEntity from '@cicctencent/common/dist/models/base/baseORM';

import {
    TaskState,
    TaskTimeSize,
    TaskExecType,
    TaskMissPolicy,
} from './taskConst';

@Entity('t_task_config')
export default class TaskConfig extends BaseEntity {
    @PrimaryGeneratedColumn({
        name: 'Fid',
        comment: '数据唯一健',
    })
    public id: number;

    @Column({
        name: 'Fname',
        type: 'varchar',
        length: 64,
        comment: '任务名称',
    })
    public name = '';

    @Column({
        name: 'Fdescription',
        type: 'varchar',
        default: '',
        length: 128,
        comment: '说明文案',
    })
    public description = '';

    @Column({
        name: 'Fscript',
        type: 'text',
        comment: '运行脚本',
    })
    public script = '';

    @Column({
        name: 'Ftime_size',
        type: 'smallint',
        default: 0,
        comment: '任务执行时间单位',
    })
    public timeSize: TaskTimeSize = TaskTimeSize.single;

    @Column({
        name: 'Ftimeout',
        type: 'int',
        default: 1800,
        comment: '超时时间，单位秒',
    })
    public timeout = 1800;

    @Column({
        name: 'Fstate',
        type: 'smallint',
        default: TaskState.init,
        comment: '任务执行时间单位',
    })
    public state: TaskState = TaskState.init;

    /**
     * 当为单次执行时，就是一个具体的时间，
     * 当为每天时，这里可以指定具体几点几分几秒执行
     * 当为每周时，格式为 "星期(1-7) HH:mm:ss"
     * 当为每月时，格式为 "几号(1-31) HH:mm:ss"
     * 当为每秒、分、时。这个值不采用，循环执行
     */
    @Column({
        name: 'Ftime_value',
        type: 'varchar',
        default: '',
        comment: '执行的具体时间，格式（YYYY-MM-DD hh:mm:ss）',
    })
    public timeValue = '';

    @Column({
        name: 'Flast_run_time',
        type: 'varchar',
        default: '',
        comment: '最后一次执行时间，格式（YYYY-MM-DD hh:mm:ss）',
    })
    public lastRunTime = '';

    /**
     * 关注人员工ID  id|id|,
     */
    @Column({
        name: 'Fwatcher',
        type: 'varchar',
        length: 64,
        default: '',
        comment: '任务关注人，staffid|staffid|...',
    })
    public watcher = '';

    /**
     * 执行器类型：0=内联JS 1=外部命令 2=子进程JS 3=shell 4=python
     */
    @Column({
        name: 'Fexec_type',
        type: 'smallint',
        default: TaskExecType.js,
        comment: '执行器类型',
    })
    public execType: TaskExecType = TaskExecType.js;

    /**
     * 外部命令/脚本入口，配合 execType 使用
     */
    @Column({
        name: 'Fexec_command',
        type: 'varchar',
        default: '',
        length: 512,
        comment: '外部命令或脚本入口',
    })
    public execCommand = '';

    /**
     * 执行工作目录，空则用系统默认
     */
    @Column({
        name: 'Fwork_dir',
        type: 'varchar',
        default: '',
        length: 512,
        comment: '执行工作目录',
    })
    public workDir = '';

    /**
     * 注入给任务的环境变量，JSON 格式
     */
    @Column({
        name: 'Fenv_json',
        type: 'text',
        nullable: true,
        comment: '任务环境变量，JSON格式',
    })
    public envJson = '';

    /**
     * 漏跑补偿策略：0=只补一次 1=全量补跑 2=跳过
     */
    @Column({
        name: 'Fmiss_policy',
        type: 'smallint',
        default: TaskMissPolicy.once,
        comment: '漏跑补偿策略',
    })
    public missPolicy: TaskMissPolicy = TaskMissPolicy.once;

    /**
     * 失败后自动重试次数
     */
    @Column({
        name: 'Fmax_retry',
        type: 'int',
        default: 0,
        comment: '失败重试次数',
    })
    public maxRetry = 0;

    /**
     * 重试间隔，单位秒
     */
    @Column({
        name: 'Fretry_interval',
        type: 'int',
        default: 60,
        comment: '重试间隔，单位秒',
    })
    public retryInterval = 60;

    /**
     * 产物目录，任务执行产物会被备份到历史目录
     */
    @Column({
        name: 'Fpublish_dir',
        type: 'varchar',
        default: '',
        length: 512,
        comment: '任务产物目录',
    })
    public publishDir = '';

    /**
     * 连续失败次数，用于触发告警
     */
    @Column({
        name: 'Fconsecutive_failures',
        type: 'int',
        default: 0,
        comment: '连续失败次数',
    })
    public consecutiveFailures = 0;

    /**
     * 上一次检测到的漏跑次数
     */
    @Column({
        name: 'Fmiss_count',
        type: 'int',
        default: 0,
        comment: '上次检测到的漏跑次数',
    })
    public missCount = 0;
}

export { TaskConfig };
