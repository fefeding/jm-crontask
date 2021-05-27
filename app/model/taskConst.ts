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
    month = 6
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
    failed = 3
}

/** 任务锁 */
export enum TaskLockKeys {
    master = 'master_lock',
    task = 'task_lock'
}

// egg任务状态
export interface EggTaskOption {
    // 1表示在执行中，0 表示等待
    status: number,
    // 当前在跑的个数
    count : number
}