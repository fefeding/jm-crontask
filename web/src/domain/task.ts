import { TaskExecType, TaskMissPolicy, TaskState, TaskStatus, TaskTimeSize } from '@/base/taskConst';

/** 任务配置 */
export interface TaskConfig {
    id: number;
    name: string;
    description: string;
    /** 任务脚本 */
    script: string;
    /** 执行时间粒度 */
    timeSize: TaskTimeSize;
    /** 执行时间值，格式随 timeSize 变化 */
    timeValue: string;
    /** 超时时间（秒） */
    timeout: number;
    /** 任务状态 */
    state: TaskState;
    /** 最后一次执行时间 */
    lastRunTime: string;
    /** 关注人 */
    watcher: string;
    /** 执行器类型 */
    execType: TaskExecType;
    /** 外部命令或脚本入口 */
    execCommand: string;
    /** 执行工作目录 */
    workDir: string;
    /** 环境变量 JSON */
    envJson: string;
    /** 漏跑补偿策略 */
    missPolicy: TaskMissPolicy;
    /** 失败重试次数 */
    maxRetry: number;
    /** 重试间隔（秒） */
    retryInterval: number;
    /** 产物目录 */
    publishDir: string;
    /** 连续失败次数 */
    consecutiveFailures: number;
    /** 最近一次检测到的漏跑次数 */
    missCount: number;
    creator?: string;
    updater?: string;
    createTime?: string;
    modifyTime?: string;
}

/** 任务实例 */
export interface TaskInstance {
    id: number;
    taskId: number;
    /** 任务名称 */
    taskName?: string;
    /** 执行服务器 */
    execServer?: string;
    execStartTime: string;
    execEndTime: string;
    /** 实例状态 */
    status: TaskStatus;
    /** 耗时（毫秒） */
    duration: number;
    /** 退出码 */
    exitCode: number;
    /** 已重试次数 */
    retryCount: number;
    /** 日志落盘路径 */
    logPath: string;
    /** 产物备份路径 */
    publishPath: string;
    /** 触发方式：0=定时 1=手动 */
    triggerType: number;
    /** 运行日志 */
    log?: string;
    creator?: string;
    updater?: string;
    createTime?: string;
    modifyTime?: string;
}

/** 分页结果 */
export interface PageResult<T> {
    data: T[];
    total: number;
}

/** 诊断问题级别 */
export type DiagnoseIssueLevel = 'error' | 'warn' | 'info';

/** 健康状态 */
export type DiagnoseHealth = 'healthy' | 'warning' | 'critical';

/** 诊断问题项 */
export interface DiagnoseIssue {
    level: DiagnoseIssueLevel;
    /** 问题编码 */
    code: string;
    title: string;
    detail: string;
    /** 修复建议 */
    suggestion: string;
}

/** 运行统计 */
export interface DiagnoseStats {
    total: number;
    finished: number;
    success: number;
    failed: number;
    timeout: number;
    canceled: number;
    running: number;
    pending: number;
    /** 成功率（%） */
    successRate: number;
    /** 超时占比（%） */
    timeoutRate: number;
    /** 平均耗时（毫秒） */
    avgDuration: number;
    /** 最大耗时（毫秒） */
    maxDuration: number;
    /** P95 耗时（毫秒） */
    p95Duration: number;
    retryTotal: number;
    recentFailStreak: number;
    lastRunTime: string;
    lastSuccessTime: string;
    consecutiveFailures: number;
    missCount: number;
}

/** 最近执行时间线 */
export interface DiagnoseTimelineItem {
    id: number;
    status: TaskStatus;
    statusText: string;
    execStartTime: string;
    duration: number;
    exitCode: number;
    retryCount: number;
    triggerType: number;
}

/** 任务健康度诊断结果 */
export interface DiagnoseResult {
    taskId: number;
    taskName: string;
    health: DiagnoseHealth;
    /** 健康分（0-100） */
    score: number;
    /** 一句话结论 */
    summary: string;
    stats: DiagnoseStats;
    issues: DiagnoseIssue[];
    timeline: DiagnoseTimelineItem[];
}
