import { Provide, Scope, ScopeEnum, Inject, Config } from '@midwayjs/core';
import { BaseService } from '@cicctencent/midwayjs-base';
import TaskService from './task';
import TaskInstanceService from './taskInstance';
import {
    TaskStatus,
    TaskState,
    TaskTimeSize,
    TaskExecType,
    TaskMissPolicy,
} from '../model/taskConst';

/** 问题等级 */
export type IssueLevel = 'error' | 'warn' | 'info';

/** 健康状态 */
export type HealthLevel = 'healthy' | 'warning' | 'critical';

export interface DiagnoseIssue {
    /** 严重级别 */
    level: IssueLevel;
    /** 问题编码，便于前端做图标映射与后续扩展 */
    code: string;
    /** 标题 */
    title: string;
    /** 详细说明 */
    detail: string;
    /** 修复建议 */
    suggestion: string;
}

export interface DiagnoseStats {
    /** 采样到的实例总数 */
    total: number;
    /** 已结束（成功/失败/超时/终止）的实例数 */
    finished: number;
    success: number;
    failed: number;
    timeout: number;
    canceled: number;
    running: number;
    pending: number;
    /** 成功率（%），无已结束实例时为 0 */
    successRate: number;
    /** 超时占比（%） */
    timeoutRate: number;
    /** 平均耗时（毫秒） */
    avgDuration: number;
    /** 最大耗时（毫秒） */
    maxDuration: number;
    /** P95 耗时（毫秒） */
    p95Duration: number;
    /** 累计重试次数 */
    retryTotal: number;
    /** 最近连续失败次数 */
    recentFailStreak: number;
    lastRunTime: string;
    lastSuccessTime: string;
    /** 任务配置上记录的连续失败次数 */
    consecutiveFailures: number;
    /** 上次检测到的漏跑次数 */
    missCount: number;
}

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

export interface DiagnoseResult {
    taskId: number;
    taskName: string;
    health: HealthLevel;
    score: number;
    summary: string;
    stats: DiagnoseStats;
    issues: DiagnoseIssue[];
    timeline: DiagnoseTimelineItem[];
}

/** 状态文案 */
const STATUS_TEXT: Record<number, string> = {
    [TaskStatus.init]: '等待执行',
    [TaskStatus.running]: '执行中',
    [TaskStatus.success]: '成功',
    [TaskStatus.failed]: '失败',
    [TaskStatus.timeout]: '超时',
    [TaskStatus.canceled]: '已终止',
};

/**
 * 取任务的固定执行间隔（秒）
 *
 * 只有秒/分/时三种是固定间隔；每天、每周、每月、cron、单次不固定，返回 0。
 */
export function getIntervalSeconds(task: any): number {
    const value = Number(task?.timeValue || 0);
    if (!value || isNaN(value) || value <= 0) return 0;
    switch (task?.timeSize) {
        case TaskTimeSize.second:
            return value;
        case TaskTimeSize.minute:
            return value * 60;
        case TaskTimeSize.hour:
            return value * 3600;
        default:
            return 0;
    }
}

/**
 * 统计最近若干次运行的表现
 *
 * @param task 任务配置
 * @param instances 实例列表，按时间倒序（最新在前）
 */
export function computeStats(task: any, instances: any[]): DiagnoseStats {
    const stats: DiagnoseStats = {
        total: 0,
        finished: 0,
        success: 0,
        failed: 0,
        timeout: 0,
        canceled: 0,
        running: 0,
        pending: 0,
        successRate: 0,
        timeoutRate: 0,
        avgDuration: 0,
        maxDuration: 0,
        p95Duration: 0,
        retryTotal: 0,
        recentFailStreak: 0,
        lastRunTime: task?.lastRunTime || '',
        lastSuccessTime: '',
        consecutiveFailures: Number(task?.consecutiveFailures || 0),
        missCount: Number(task?.missCount || 0),
    };

    const durations: number[] = [];

    for (const ins of instances || []) {
        stats.total++;
        switch (ins.status) {
            case TaskStatus.success:
                stats.success++;
                stats.finished++;
                break;
            case TaskStatus.failed:
                stats.failed++;
                stats.finished++;
                break;
            case TaskStatus.timeout:
                stats.timeout++;
                stats.finished++;
                break;
            case TaskStatus.canceled:
                stats.canceled++;
                stats.finished++;
                break;
            case TaskStatus.running:
                stats.running++;
                break;
            default:
                stats.pending++;
        }

        if (Number(ins.duration) > 0) {
            durations.push(Number(ins.duration));
        }
        stats.retryTotal += Number(ins.retryCount || 0);
    }

    if (stats.finished > 0) {
        stats.successRate = Math.round((stats.success / stats.finished) * 100);
        stats.timeoutRate = Math.round((stats.timeout / stats.finished) * 100);
    }

    if (durations.length) {
        durations.sort((a, b) => a - b);
        const sum = durations.reduce((acc, cur) => acc + cur, 0);
        stats.avgDuration = Math.round(sum / durations.length);
        stats.maxDuration = durations[durations.length - 1];
        const idx = Math.min(
            durations.length - 1,
            Math.floor(durations.length * 0.95)
        );
        stats.p95Duration = durations[idx];
    }

    // 最近连续失败次数（实例已按时间倒序）
    for (const ins of instances || []) {
        if (ins.status === TaskStatus.failed || ins.status === TaskStatus.timeout) {
            stats.recentFailStreak++;
        }
        else {
            break;
        }
    }

    // 最近一次成功的时间
    const lastSuccess = (instances || []).find(
        ins => ins.status === TaskStatus.success
    );
    if (lastSuccess) {
        stats.lastSuccessTime = lastSuccess.execStartTime || '';
    }

    return stats;
}

/**
 * 配置体检：只看任务自身的配置是否合理
 */
export function checkConfig(
    task: any,
    ctx: { globalReceivers?: string[] } = {}
): DiagnoseIssue[] {
    const issues: DiagnoseIssue[] = [];
    const execType = Number(task?.execType ?? TaskExecType.js);
    const timeout = Number(task?.timeout || 0);
    const script = String(task?.script || '').trim();
    const execCommand = String(task?.execCommand || '').trim();

    if (execType === TaskExecType.js) {
        issues.push({
            level: 'warn',
            code: 'exec_inline',
            title: '内联执行器无法强制中断',
            detail:
                '内联 JS 运行在服务主进程中，超时后只能把实例标记为超时，脚本本身仍在继续执行，可能长时间占用并发额度。',
            suggestion: '建议改用「子进程 JS」执行器，超时后可真实终止进程。',
        });
    }

    const isInlineScript = execType === TaskExecType.js || execType === TaskExecType.node;
    if (isInlineScript && !script) {
        issues.push({
            level: 'error',
            code: 'script_empty',
            title: '未配置脚本内容',
            detail: '当前执行器需要任务脚本，但脚本内容为空。',
            suggestion: '请在任务编辑页填写脚本，或切换到外部命令执行器。',
        });
    }
    if (!isInlineScript && !execCommand) {
        issues.push({
            level: 'error',
            code: 'command_empty',
            title: '未配置执行入口',
            detail: '外部执行器需要指定脚本路径或命令行，当前为空。',
            suggestion: '请在任务编辑页填写执行入口。',
        });
    }

    if (timeout <= 0) {
        issues.push({
            level: 'error',
            code: 'timeout_invalid',
            title: '超时时间非法',
            detail: '超时时间为 0 或负数，任务将无法正常结束。',
            suggestion: '请设置一个大于 0 的超时时间（秒）。',
        });
    }
    else if (timeout > 86400) {
        issues.push({
            level: 'warn',
            code: 'timeout_too_long',
            title: '超时时间过长',
            detail: `超时时间为 ${timeout} 秒，超过 24 小时，失控任务会长期占用并发额度。`,
            suggestion: '建议按任务实际耗时设置超时，留出合理余量。',
        });
    }

    const interval = getIntervalSeconds(task);
    if (interval > 0 && timeout > interval) {
        issues.push({
            level: 'warn',
            code: 'timeout_gt_interval',
            title: '超时时间超过执行间隔',
            detail: `超时 ${timeout} 秒大于执行间隔 ${interval} 秒，任务执行未结束时下一次调度已到期，会不断堆积。`,
            suggestion: '将超时时间调整到小于执行间隔，或拉长执行间隔。',
        });
    }

    const watcher = String(task?.watcher || '').trim();
    if (!watcher && !(ctx.globalReceivers || []).length) {
        issues.push({
            level: 'warn',
            code: 'no_receiver',
            title: '告警无处送达',
            detail:
                '任务未配置关注人，且系统未配置全局接收人，任务失败时告警无法送达任何人。',
            suggestion: '请配置任务关注人，或在 notify 配置中设置全局 receivers。',
        });
    }

    if (Number(task?.state) !== TaskState.start) {
        issues.push({
            level: 'info',
            code: 'task_not_enabled',
            title: '任务当前未启用',
            detail: '任务处于停用或失效状态，不会被调度执行。',
            suggestion: '如需执行，请在任务列表中启用该任务。',
        });
    }

    if (Number(task?.maxRetry || 0) > 0 && Number(task?.retryInterval || 0) <= 0) {
        issues.push({
            level: 'warn',
            code: 'retry_interval_invalid',
            title: '重试间隔非法',
            detail: '配置了失败重试，但重试间隔为 0，失败后会立即重试。',
            suggestion: '请设置大于 0 的重试间隔（秒）。',
        });
    }

    const envJson = String(task?.envJson || '').trim();
    if (envJson) {
        try {
            JSON.parse(envJson);
        }
        catch (e) {
            issues.push({
                level: 'warn',
                code: 'env_invalid_json',
                title: '环境变量不是合法 JSON',
                detail: '注入给任务的环境变量无法被解析，执行时会被忽略。',
                suggestion: '请修正为合法的 JSON 字符串，例如 {"NODE_ENV":"production"}。',
            });
        }
    }

    if (
        Number(task?.missPolicy) === TaskMissPolicy.skip &&
        interval > 0 &&
        interval <= 300
    ) {
        issues.push({
            level: 'info',
            code: 'miss_skip_fast',
            title: '高频任务不补跑漏跑',
            detail: `任务执行间隔为 ${interval} 秒，但漏跑补偿策略为「跳过」，停机期间错过的执行点不会补跑。`,
            suggestion: '若对数据完整性敏感，建议改为「合并补跑一次」。',
        });
    }

    return issues;
}

/**
 * 运行体检：结合历史运行数据判断任务是否健康
 */
export function checkRuntime(task: any, stats: DiagnoseStats): DiagnoseIssue[] {
    const issues: DiagnoseIssue[] = [];
    const timeoutMs = Number(task?.timeout || 0) * 1000;

    if (stats.total === 0) {
        issues.push({
            level: 'info',
            code: 'no_history',
            title: '尚无运行记录',
            detail: '该任务还没有执行历史，暂时无法评估运行健康度。',
            suggestion: '可先手动执行一次，再回来查看诊断结果。',
        });
    }

    if (stats.consecutiveFailures >= 3) {
        issues.push({
            level: 'error',
            code: 'consecutive_failures',
            title: '连续失败',
            detail: `任务已连续失败 ${stats.consecutiveFailures} 次。`,
            suggestion: '请查看最近一次实例的日志定位原因，修复后再启用。',
        });
    }

    if (stats.missCount > 0) {
        issues.push({
            level: 'warn',
            code: 'missed',
            title: '存在漏跑',
            detail: `上次调度检测到漏跑 ${stats.missCount} 次，说明调度器曾中断或延迟。`,
            suggestion: '请确认调度节点运行状态，并按需调整漏跑补偿策略。',
        });
    }

    if (stats.finished >= 5 && stats.success === 0) {
        issues.push({
            level: 'error',
            code: 'never_success',
            title: '从未成功执行',
            detail: `最近 ${stats.finished} 次执行全部失败或超时，没有任何一次成功。`,
            suggestion: '请查看日志确认脚本或环境是否存在根本性问题。',
        });
    }
    else if (stats.finished >= 5 && stats.successRate < 60) {
        issues.push({
            level: 'warn',
            code: 'low_success_rate',
            title: '成功率偏低',
            detail: `最近 ${stats.finished} 次执行成功率为 ${stats.successRate}%。`,
            suggestion: '建议查看失败实例的日志，确认是否为偶发网络或数据问题。',
        });
    }

    if (stats.finished >= 5 && stats.timeoutRate >= 30) {
        issues.push({
            level: 'warn',
            code: 'high_timeout_rate',
            title: '超时比例偏高',
            detail: `最近 ${stats.finished} 次执行中有 ${stats.timeout} 次超时（${stats.timeoutRate}%）。`,
            suggestion: '可适当调大超时时间，或优化脚本性能。',
        });
    }

    if (
        timeoutMs > 0 &&
        stats.finished >= 3 &&
        stats.p95Duration > timeoutMs * 0.8
    ) {
        issues.push({
            level: 'warn',
            code: 'near_timeout',
            title: '耗时接近超时阈值',
            detail: `P95 耗时 ${stats.p95Duration}ms，已达超时阈值（${timeoutMs}ms）的 ${Math.round(
                (stats.p95Duration / timeoutMs) * 100
            )}%。`,
            suggestion: '建议适当调大超时时间，避免业务高峰期被强制中断。',
        });
    }

    if (stats.recentFailStreak >= 2 && stats.consecutiveFailures < 3) {
        issues.push({
            level: 'warn',
            code: 'recent_fail_streak',
            title: '近期连续失败',
            detail: `最近连续 ${stats.recentFailStreak} 次执行失败或超时。`,
            suggestion: '请关注后续执行结果，若持续失败请查看日志定位原因。',
        });
    }

    if (stats.running > 0) {
        issues.push({
            level: 'info',
            code: 'running_now',
            title: '当前正在执行',
            detail: `有 ${stats.running} 个实例处于运行中。`,
            suggestion: '无需处理，如长时间未结束可使用「终止」功能强制结束。',
        });
    }

    return issues;
}

/**
 * 根据问题清单计算健康分与健康等级
 */
export function computeScore(issues: DiagnoseIssue[]): {
    score: number;
    health: HealthLevel;
} {
    let score = 100;
    for (const issue of issues || []) {
        if (issue.level === 'error') score -= 25;
        else if (issue.level === 'warn') score -= 10;
        else score -= 2;
    }
    score = Math.max(0, Math.min(100, score));
    const health: HealthLevel =
        score >= 85 ? 'healthy' : score >= 60 ? 'warning' : 'critical';
    return { score, health };
}

/**
 * 生成一句话结论
 */
export function buildSummary(
    health: HealthLevel,
    score: number,
    issues: DiagnoseIssue[]
): string {
    const errors = issues.filter(i => i.level === 'error').length;
    const warns = issues.filter(i => i.level === 'warn').length;

    if (!errors && !warns) {
        return `任务健康状况良好（${score} 分），未发现明显问题。`;
    }
    const parts: string[] = [];
    if (errors) parts.push(`${errors} 个严重问题`);
    if (warns) parts.push(`${warns} 个警告`);
    const first = issues.find(i => i.level === 'error') || issues[0];
    return `健康分 ${score} 分，发现 ${parts.join('、')}，最需关注：${first?.title || ''}。`;
}

/**
 * 构造最近执行时间线
 */
export function buildTimeline(
    instances: any[],
    limit = 10
): DiagnoseTimelineItem[] {
    return (instances || []).slice(0, limit).map(ins => ({
        id: ins.id,
        status: ins.status,
        statusText: STATUS_TEXT[ins.status] || '未知',
        execStartTime: ins.execStartTime || '',
        duration: Number(ins.duration || 0),
        exitCode: Number(ins.exitCode || 0),
        retryCount: Number(ins.retryCount || 0),
        triggerType: Number(ins.triggerType || 0),
    }));
}

/**
 * 任务健康度诊断服务
 *
 * 把「任务为什么失败、为什么没跑、为什么不稳定」一次性说清楚：
 * 1. 统计最近若干次执行的表现（成功率、耗时分布、失败趋势）
 * 2. 体检任务配置（执行器、超时、告警接收人、重试、漏跑策略等）
 * 3. 输出带修复建议的问题清单与健康分
 */
@Provide()
@Scope(ScopeEnum.Singleton)
export default class DiagnoseService extends BaseService {
    @Inject()
    taskService: TaskService;

    @Inject()
    taskInstanceService: TaskInstanceService;

    @Config('notify')
    notifyConfig: { receivers?: string[] };

    /**
     * 诊断单个任务的健康状况
     */
    async diagnose(taskId: number): Promise<DiagnoseResult> {
        const task = await this.taskService.getById(taskId);
        if (!task) {
            throw new Error('任务不存在');
        }

        const instances = await this.taskInstanceService.getRecentByTask(
            taskId,
            100
        );

        const stats = computeStats(task, instances);
        const issues = [
            ...checkConfig(task, {
                globalReceivers: this.notifyConfig?.receivers || [],
            }),
            ...checkRuntime(task, stats),
        ];
        const { score, health } = computeScore(issues);

        return {
            taskId: task.id,
            taskName: task.name,
            health,
            score,
            summary: buildSummary(health, score, issues),
            stats,
            issues,
            timeline: buildTimeline(instances, 10),
        };
    }
}
