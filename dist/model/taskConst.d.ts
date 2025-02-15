/** 任务执行粒度 */
export declare enum TaskTimeSize {
    /** 单次执行 */
    single = 0,
    /** 循环执行的任务 */
    second = 1,
    minute = 2,
    hour = 3,
    day = 4,
    week = 5,
    month = 6,
    crontab = 7
}
export declare enum TaskState {
    /** 初始化 */
    init = 0,
    /** 已启用 */
    start = 1,
    /** 已停用 */
    stop = 2,
    /** 已失效 */
    disabled = 3
}
export declare enum TaskStatus {
    /** 初始化 */
    init = 0,
    /** 运行中 */
    running = 1,
    /** 运行成功 */
    success = 2,
    /** 执行失败 */
    failed = 3,
    /** 执行超时 */
    timeout = 4
}
/** 任务锁 */
export declare enum TaskLockKeys {
    master = "master_lock",
    task = "task_lock"
}
export interface EggTaskOption {
    status: number;
    count: number;
}
