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
    crontab = 7
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
    /** 已取消（人工终止） */
    canceled = 5
}

/**
 * 任务执行器类型
 */
export enum TaskExecType {
    /** 内联 JS 脚本（主进程执行，兼容历史任务） */
    js = 0,
    /** 外部命令 */
    command = 1,
    /** 子进程执行 JS 脚本 */
    node = 2,
    /** shell 脚本 */
    shell = 3,
    /** python 脚本 */
    python = 4
}

/**
 * 漏跑补偿策略
 */
export enum TaskMissPolicy {
    /** 只补跑一次 */
    once = 0,
    /** 全量补跑 */
    all = 1,
    /** 跳过不补 */
    skip = 2
}

/** 任务锁 */
export enum TaskLockKeys {
    master = 'master_lock',
    task = 'task_lock',
    watchdog = 'watchdog_lock'
}

// egg任务状态
export interface EggTaskOption {
    // 1表示在执行中，0 表示等待
    status: number,
    // 当前在跑的个数
    count : number
}