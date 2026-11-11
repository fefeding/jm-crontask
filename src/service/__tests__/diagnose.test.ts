import {
    computeStats,
    checkConfig,
    checkRuntime,
    computeScore,
    buildSummary,
    buildTimeline,
    getIntervalSeconds,
} from '../diagnose';
import {
    TaskStatus,
    TaskState,
    TaskTimeSize,
    TaskExecType,
    TaskMissPolicy,
} from '../../model/taskConst';

/** 构造一个正常的任务配置 */
function makeTask(overrides: any = {}) {
    return {
        id: 1,
        name: '测试任务',
        script: 'console.info(1)',
        timeSize: TaskTimeSize.minute,
        timeValue: '5',
        timeout: 60,
        state: TaskState.start,
        watcher: 'alice',
        execType: TaskExecType.node,
        execCommand: '',
        envJson: '',
        missPolicy: TaskMissPolicy.once,
        maxRetry: 0,
        retryInterval: 60,
        consecutiveFailures: 0,
        missCount: 0,
        lastRunTime: '2026-03-10 10:00:00',
        ...overrides,
    };
}

/** 构造实例 */
function makeInstance(overrides: any = {}) {
    return {
        id: 1,
        status: TaskStatus.success,
        duration: 100,
        exitCode: 0,
        retryCount: 0,
        execStartTime: '2026-03-10 10:00:00',
        triggerType: 0,
        ...overrides,
    };
}

describe('任务健康度诊断', () => {
    describe('getIntervalSeconds', () => {
        it('秒/分/时换算为秒', () => {
            expect(
                getIntervalSeconds({
                    timeSize: TaskTimeSize.second,
                    timeValue: '30',
                })
            ).toBe(30);
            expect(
                getIntervalSeconds({
                    timeSize: TaskTimeSize.minute,
                    timeValue: '5',
                })
            ).toBe(300);
            expect(
                getIntervalSeconds({
                    timeSize: TaskTimeSize.hour,
                    timeValue: '2',
                })
            ).toBe(7200);
        });

        it('每天/每周/每月/cron 不是固定间隔，返回 0', () => {
            expect(
                getIntervalSeconds({
                    timeSize: TaskTimeSize.day,
                    timeValue: '10:00:00',
                })
            ).toBe(0);
            expect(
                getIntervalSeconds({
                    timeSize: TaskTimeSize.week,
                    timeValue: '1 10:00:00',
                })
            ).toBe(0);
            expect(
                getIntervalSeconds({
                    timeSize: TaskTimeSize.month,
                    timeValue: '15 10:00:00',
                })
            ).toBe(0);
            expect(
                getIntervalSeconds({
                    timeSize: TaskTimeSize.crontab,
                    timeValue: '* * * * *',
                })
            ).toBe(0);
        });
    });

    describe('computeStats', () => {
        it('按状态分类计数并计算成功率', () => {
            const instances = [
                makeInstance({ id: 1, status: TaskStatus.success }),
                makeInstance({ id: 2, status: TaskStatus.success }),
                makeInstance({ id: 3, status: TaskStatus.failed }),
                makeInstance({ id: 4, status: TaskStatus.timeout }),
                makeInstance({ id: 5, status: TaskStatus.running }),
                makeInstance({ id: 6, status: TaskStatus.init }),
            ];
            const stats = computeStats(makeTask(), instances);

            expect(stats.total).toBe(6);
            expect(stats.finished).toBe(4);
            expect(stats.success).toBe(2);
            expect(stats.failed).toBe(1);
            expect(stats.timeout).toBe(1);
            expect(stats.running).toBe(1);
            expect(stats.pending).toBe(1);
            // 成功率以已结束实例为分母
            expect(stats.successRate).toBe(50);
            expect(stats.timeoutRate).toBe(25);
        });

        it('计算平均、最大与 P95 耗时', () => {
            const instances = [
                makeInstance({ id: 1, duration: 100 }),
                makeInstance({ id: 2, duration: 200 }),
                makeInstance({ id: 3, duration: 300 }),
                makeInstance({ id: 4, duration: 400 }),
            ];
            const stats = computeStats(makeTask(), instances);
            expect(stats.avgDuration).toBe(250);
            expect(stats.maxDuration).toBe(400);
            expect(stats.p95Duration).toBe(400);
        });

        it('统计最近连续失败次数', () => {
            const instances = [
                makeInstance({ id: 1, status: TaskStatus.failed }),
                makeInstance({ id: 2, status: TaskStatus.timeout }),
                makeInstance({ id: 3, status: TaskStatus.success }),
                makeInstance({ id: 4, status: TaskStatus.failed }),
            ];
            const stats = computeStats(makeTask(), instances);
            expect(stats.recentFailStreak).toBe(2);
        });

        it('累计重试次数并记录最近一次成功时间', () => {
            const instances = [
                makeInstance({
                    id: 1,
                    status: TaskStatus.failed,
                    retryCount: 2,
                }),
                makeInstance({
                    id: 2,
                    status: TaskStatus.success,
                    retryCount: 1,
                    execStartTime: '2026-03-09 09:00:00',
                }),
            ];
            const stats = computeStats(makeTask(), instances);
            expect(stats.retryTotal).toBe(3);
            expect(stats.lastSuccessTime).toBe('2026-03-09 09:00:00');
        });

        it('无已结束实例时成功率为 0 且不抛异常', () => {
            const stats = computeStats(makeTask(), []);
            expect(stats.total).toBe(0);
            expect(stats.successRate).toBe(0);
            expect(stats.avgDuration).toBe(0);
        });
    });

    describe('checkConfig', () => {
        it('内联执行器给出无法强制中断的警告', () => {
            const issues = checkConfig(makeTask({ execType: TaskExecType.js }));
            expect(issues.find(i => i.code === 'exec_inline')?.level).toBe(
                'warn'
            );
        });

        it('子进程执行器不产生内联警告', () => {
            const issues = checkConfig(
                makeTask({ execType: TaskExecType.node })
            );
            expect(issues.find(i => i.code === 'exec_inline')).toBeUndefined();
        });

        it('脚本为空报严重问题', () => {
            const issues = checkConfig(makeTask({ script: '   ' }));
            expect(issues.find(i => i.code === 'script_empty')?.level).toBe(
                'error'
            );
        });

        it('外部执行器缺少入口报严重问题', () => {
            const issues = checkConfig(
                makeTask({ execType: TaskExecType.shell, execCommand: '' })
            );
            expect(issues.find(i => i.code === 'command_empty')?.level).toBe(
                'error'
            );
        });

        it('超时时间超过执行间隔时告警', () => {
            const issues = checkConfig(
                makeTask({
                    timeSize: TaskTimeSize.minute,
                    timeValue: '1',
                    timeout: 600,
                })
            );
            expect(
                issues.find(i => i.code === 'timeout_gt_interval')?.level
            ).toBe('warn');
        });

        it('超时时间非法报严重问题', () => {
            const issues = checkConfig(makeTask({ timeout: 0 }));
            expect(issues.find(i => i.code === 'timeout_invalid')?.level).toBe(
                'error'
            );
        });

        it('无关注人且无全局接收人时告警无处送达', () => {
            const issues = checkConfig(makeTask({ watcher: '' }), {});
            expect(issues.find(i => i.code === 'no_receiver')?.level).toBe(
                'warn'
            );
        });

        it('配置了全局接收人后不再提示无处送达', () => {
            const issues = checkConfig(makeTask({ watcher: '' }), {
                globalReceivers: ['staff1'],
            });
            expect(issues.find(i => i.code === 'no_receiver')).toBeUndefined();
        });

        it('环境变量不是合法 JSON 时告警', () => {
            const issues = checkConfig(makeTask({ envJson: '{bad json' }));
            expect(issues.find(i => i.code === 'env_invalid_json')?.level).toBe(
                'warn'
            );
        });

        it('环境变量合法时不告警', () => {
            const issues = checkConfig(makeTask({ envJson: '{"A":"1"}' }));
            expect(
                issues.find(i => i.code === 'env_invalid_json')
            ).toBeUndefined();
        });

        it('任务未启用时给出提示', () => {
            const issues = checkConfig(makeTask({ state: TaskState.stop }));
            expect(issues.find(i => i.code === 'task_not_enabled')?.level).toBe(
                'info'
            );
        });

        it('高频任务配置跳过补跑时给出提示', () => {
            const issues = checkConfig(
                makeTask({
                    timeSize: TaskTimeSize.second,
                    timeValue: '30',
                    missPolicy: TaskMissPolicy.skip,
                })
            );
            expect(issues.find(i => i.code === 'miss_skip_fast')?.level).toBe(
                'info'
            );
        });
    });

    describe('checkRuntime', () => {
        it('无运行记录时给出提示', () => {
            const stats = computeStats(makeTask(), []);
            const issues = checkRuntime(makeTask(), stats);
            expect(issues.find(i => i.code === 'no_history')?.level).toBe(
                'info'
            );
        });

        it('连续失败 3 次报严重问题', () => {
            const stats = computeStats(
                makeTask({ consecutiveFailures: 3 }),
                []
            );
            const issues = checkRuntime(makeTask(), stats);
            expect(
                issues.find(i => i.code === 'consecutive_failures')?.level
            ).toBe('error');
        });

        it('全部失败且样本足够时报从未成功执行', () => {
            const instances = Array.from({ length: 5 }).map((_, i) =>
                makeInstance({ id: i + 1, status: TaskStatus.failed })
            );
            const stats = computeStats(makeTask(), instances);
            const issues = checkRuntime(makeTask(), stats);
            expect(issues.find(i => i.code === 'never_success')?.level).toBe(
                'error'
            );
        });

        it('成功率偏低时告警', () => {
            const instances = [
                ...Array.from({ length: 6 }).map((_, i) =>
                    makeInstance({ id: i + 1, status: TaskStatus.failed })
                ),
                makeInstance({ id: 7, status: TaskStatus.success }),
            ];
            const stats = computeStats(makeTask(), instances);
            const issues = checkRuntime(makeTask(), stats);
            expect(issues.find(i => i.code === 'low_success_rate')?.level).toBe(
                'warn'
            );
        });

        it('超时比例偏高时告警', () => {
            const instances = Array.from({ length: 5 }).map((_, i) =>
                makeInstance({ id: i + 1, status: TaskStatus.timeout })
            );
            const stats = computeStats(makeTask(), instances);
            const issues = checkRuntime(makeTask(), stats);
            expect(
                issues.find(i => i.code === 'high_timeout_rate')?.level
            ).toBe('warn');
        });

        it('耗时接近超时阈值时告警', () => {
            const instances = Array.from({ length: 4 }).map((_, i) =>
                makeInstance({ id: i + 1, duration: 55000 })
            );
            const stats = computeStats(makeTask({ timeout: 60 }), instances);
            const issues = checkRuntime(makeTask({ timeout: 60 }), stats);
            expect(issues.find(i => i.code === 'near_timeout')?.level).toBe(
                'warn'
            );
        });

        it('存在漏跑时告警', () => {
            const stats = computeStats(makeTask({ missCount: 3 }), []);
            const issues = checkRuntime(makeTask(), stats);
            expect(issues.find(i => i.code === 'missed')?.level).toBe('warn');
        });
    });

    describe('computeScore', () => {
        it('无问题时为满分健康', () => {
            const { score, health } = computeScore([]);
            expect(score).toBe(100);
            expect(health).toBe('healthy');
        });

        it('严重问题拉低分数至 critical', () => {
            const issues = Array.from({ length: 4 }).map(() => ({
                level: 'error' as const,
                code: 'x',
                title: 'x',
                detail: '',
                suggestion: '',
            }));
            const { score, health } = computeScore(issues);
            expect(score).toBe(0);
            expect(health).toBe('critical');
        });

        it('警告扣分但仍可保持 warning', () => {
            const issues = Array.from({ length: 3 }).map(() => ({
                level: 'warn' as const,
                code: 'x',
                title: 'x',
                detail: '',
                suggestion: '',
            }));
            const { score, health } = computeScore(issues);
            expect(score).toBe(70);
            expect(health).toBe('warning');
        });
    });

    describe('buildSummary / buildTimeline', () => {
        it('无问题时给出良好结论', () => {
            expect(buildSummary('healthy', 100, [])).toContain('良好');
        });

        it('有问题时结论包含最需关注项', () => {
            const issues = [
                {
                    level: 'error' as const,
                    code: 'x',
                    title: '连续失败',
                    detail: '',
                    suggestion: '',
                },
            ];
            expect(buildSummary('critical', 75, issues)).toContain('连续失败');
        });

        it('时间线按倒序截取并带状态文案', () => {
            const instances = [
                makeInstance({ id: 10, status: TaskStatus.failed }),
                makeInstance({ id: 9, status: TaskStatus.success }),
            ];
            const timeline = buildTimeline(instances, 2);
            expect(timeline).toHaveLength(2);
            expect(timeline[0].id).toBe(10);
            expect(timeline[0].statusText).toBe('失败');
            expect(timeline[1].statusText).toBe('成功');
        });
    });
});
