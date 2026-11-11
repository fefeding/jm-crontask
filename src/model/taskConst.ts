/** 任务执行粒度 */
export enum TaskTimeSize {
    /** 单次执行 */
    single = 0,
    /** 循环执行的任务 */
    // 秒
    second = 1,
    // 分
    minute = 2,
    // 小时
    hour = 3,
    // 按天
    day = 4,
    // 按周
    week = 5,
    // 按月
    month = 6,
    // 定时规则
    crontab = 7,
}

// 任务当前状态
export enum TaskState {
    /** 初始化 */
    init = 0,
    /** 已启用 */
    start = 1,
    /** 已停用 */
    stop = 2,
    /** 已失效 */
    disabled = 3,
}

// 任务当前状态
export enum TaskStatus {
    /** 初始化 */
    init = 0,
    /** 运行中 */
    running = 1,
    /** 运行成功 */
    success = 2,
    /** 执行失败 */
    failed = 3,
    /** 执行超时 */
    timeout = 4,
    /** 已取消（人工终止或被看门狗强制中断） */
    canceled = 5,
}

/**
 * 任务执行器类型
 * 决定任务脚本用什么方式被执行
 */
export enum TaskExecType {
    /** 内联 JS 脚本（jm-jsruntime，主进程内执行，兼容历史任务，无强杀能力） */
    js = 0,
    /** 外部命令（通过 shell 执行任意命令行，支持多语言） */
    command = 1,
    /** 独立子进程执行 JS 脚本（可真实超时中断、崩溃隔离，推荐） */
    node = 2,
    /** shell 脚本 */
    shell = 3,
    /** python 脚本 */
    python = 4,
}

/**
 * 漏跑补偿策略
 * 服务停机或调度器异常期间错过的执行点，如何补偿
 */
export enum TaskMissPolicy {
    /** 只补跑一次（默认，保证不重复堆积） */
    once = 0,
    /** 全量补跑（受最大补偿次数限制） */
    all = 1,
    /** 跳过，不补跑 */
    skip = 2,
}

/** 告警类型 */
export enum AlertType {
    /** 任务执行失败 */
    taskFailed = 'taskFailed',
    /** 任务执行超时 */
    taskTimeout = 'taskTimeout',
    /** 任务启动失败 */
    taskStartFailed = 'taskStartFailed',
    /** 任务连续失败 */
    taskConsecutiveFailure = 'taskConsecutiveFailure',
    /** 任务恢复（连续失败后重新成功） */
    taskRecovered = 'taskRecovered',
    /** 任务漏跑 */
    taskMissed = 'taskMissed',
    /** 任务配置非法 */
    taskInvalidConfig = 'taskInvalidConfig',
    /** 系统级异常 */
    systemError = 'systemError',
}

/** 通知通道类型 */
export enum NotifyChannelType {
    /** 写入服务日志 */
    log = 'log',
    /** 输出到控制台 */
    console = 'console',
    /** 通用 webhook（POST JSON） */
    webhook = 'webhook',
    /** 企业微信机器人 */
    wecom = 'wecom',
    /** 钉钉机器人 */
    dingtalk = 'dingtalk',
}

/** 任务锁 */
export enum TaskLockKeys {
    master = 'master_lock',
    task = 'task_lock',
    /** 超时看门狗与维护任务锁 */
    watchdog = 'watchdog_lock',
}

// egg任务状态
export interface EggTaskOption {
    // 1表示在执行中，0 表示等待
    status: number;
    // 当前在跑的个数
    count: number;
}
