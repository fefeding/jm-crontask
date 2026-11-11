import { calcSchedule } from '../time-calculator';
import { TaskTimeSize } from '../../model/taskConst';

const DAY = 24 * 3600 * 1000;

/** 构造本地时间时间戳 */
function localTime(
    y: number,
    m: number,
    d: number,
    h = 0,
    mi = 0,
    s = 0
): number {
    return new Date(y, m - 1, d, h, mi, s, 0).getTime();
}

/** 格式化为 'YYYY-MM-DD HH:mm:ss' */
function fmt(ts: number): string {
    const d = new Date(ts);
    const p = (n: number) => String(n).padStart(2, '0');
    return (
        `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ` +
        `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
    );
}

describe('时间计算器 calcSchedule', () => {
    describe('crontab 定时规则', () => {
        // 整分钟对齐的时间戳（上海时区与 UTC 的分钟边界一致）
        const BASE = Math.floor(1750000000000 / 60000) * 60000;

        it('新任务首次即可触发（回归：修复 lastRunTime 为空时永不触发）', () => {
            const task = {
                timeSize: TaskTimeSize.crontab,
                timeValue: '* * * * *',
                lastRunTime: '',
                createTime: new Date(BASE),
            };
            const info = calcSchedule(task, BASE + 65000);
            expect(info.error).toBeUndefined();
            expect(info.due).toBe(true);
            expect(info.missed).toBe(1);
        });

        it('刚执行完不会重复触发', () => {
            const task = {
                timeSize: TaskTimeSize.crontab,
                timeValue: '* * * * *',
                lastRunTime: fmt(BASE),
                createTime: new Date(BASE),
            };
            const info = calcSchedule(task, BASE + 5000);
            expect(info.due).toBe(false);
            expect(info.missed).toBe(0);
            expect(info.nextRunAt).toBe(BASE + 60000);
        });

        it('停机期间的多次漏跑能被准确统计', () => {
            const task = {
                timeSize: TaskTimeSize.crontab,
                timeValue: '* * * * *',
                lastRunTime: fmt(BASE),
                createTime: new Date(BASE),
            };
            const info = calcSchedule(task, BASE + 5 * 60000 + 1000);
            expect(info.due).toBe(true);
            expect(info.missed).toBe(5);
        });

        it('非法表达式返回错误而不是抛异常', () => {
            const task = {
                timeSize: TaskTimeSize.crontab,
                timeValue: 'not a cron',
                lastRunTime: '',
                createTime: new Date(BASE),
            };
            const info = calcSchedule(task, BASE);
            expect(info.due).toBe(false);
            expect(info.error).toBeTruthy();
        });
    });

    describe('固定间隔任务', () => {
        const now = localTime(2026, 3, 10, 12, 0, 0);

        it('从未执行过的间隔任务启用后立即可执行', () => {
            const task = {
                timeSize: TaskTimeSize.minute,
                timeValue: '5',
                lastRunTime: '',
                createTime: new Date(now),
            };
            const info = calcSchedule(task, now);
            expect(info.due).toBe(true);
            expect(info.missed).toBe(1);
            expect(info.nextRunAt).toBe(now + 5 * 60000);
        });

        it('未到执行时间不触发', () => {
            const task = {
                timeSize: TaskTimeSize.minute,
                timeValue: '5',
                lastRunTime: fmt(now - 60000),
                createTime: new Date(now),
            };
            const info = calcSchedule(task, now);
            expect(info.due).toBe(false);
            expect(info.missed).toBe(0);
            expect(info.nextRunAt).toBe(now + 4 * 60000);
        });

        it('停机 16 分钟后按 5 分钟间隔统计出 3 次漏跑', () => {
            const task = {
                timeSize: TaskTimeSize.minute,
                timeValue: '5',
                lastRunTime: fmt(now - 16 * 60000),
                createTime: new Date(now),
            };
            const info = calcSchedule(task, now);
            expect(info.due).toBe(true);
            expect(info.missed).toBe(3);
        });

        it('非法间隔返回错误', () => {
            const task = {
                timeSize: TaskTimeSize.hour,
                timeValue: '0',
                lastRunTime: '',
                createTime: new Date(now),
            };
            const info = calcSchedule(task, now);
            expect(info.due).toBe(false);
            expect(info.error).toBeTruthy();
        });
    });

    describe('每天', () => {
        it('未到点时不触发，下次为今天该时刻', () => {
            const now = localTime(2026, 3, 10, 9, 0, 0);
            const task = {
                timeSize: TaskTimeSize.day,
                timeValue: '10:00:00',
                lastRunTime: '',
                createTime: new Date(now),
            };
            const info = calcSchedule(task, now);
            expect(info.due).toBe(false);
            expect(info.nextRunAt).toBe(localTime(2026, 3, 10, 10, 0, 0));
        });

        it('今天已执行过时等明天', () => {
            const now = localTime(2026, 3, 10, 11, 0, 0);
            const task = {
                timeSize: TaskTimeSize.day,
                timeValue: '10:00:00',
                lastRunTime: '2026-03-10 10:00:00',
                createTime: new Date(now),
            };
            const info = calcSchedule(task, now);
            expect(info.due).toBe(false);
            expect(info.nextRunAt).toBe(localTime(2026, 3, 11, 10, 0, 0));
        });

        it('漏跑两天统计为 2 次（锚点本身不再计入）', () => {
            const now = localTime(2026, 3, 10, 11, 0, 0);
            const task = {
                timeSize: TaskTimeSize.day,
                timeValue: '10:00:00',
                lastRunTime: '2026-03-08 10:00:00',
                createTime: new Date(now),
            };
            const info = calcSchedule(task, now);
            expect(info.due).toBe(true);
            expect(info.missed).toBe(2);
        });
    });

    describe('每周（此前完全未实现）', () => {
        // 2026-03-09 是周一
        const monday10 = localTime(2026, 3, 9, 10, 0, 0);

        it('周一到点后触发，并给出下周一的下次执行时间', () => {
            const now = monday10 + 3600000;
            const task = {
                timeSize: TaskTimeSize.week,
                timeValue: '1 10:00:00',
                lastRunTime: fmt(monday10 - 7 * DAY),
                createTime: new Date(now),
            };
            const info = calcSchedule(task, now);
            expect(info.error).toBeUndefined();
            expect(info.due).toBe(true);
            expect(info.missed).toBe(1);
            expect(info.nextRunAt).toBe(monday10 + 7 * DAY);
        });

        it('周中尚未到点时不触发', () => {
            const now = localTime(2026, 3, 10, 9, 0, 0); // 周二
            const task = {
                timeSize: TaskTimeSize.week,
                timeValue: '1 10:00:00',
                lastRunTime: '',
                createTime: new Date(now),
            };
            const info = calcSchedule(task, now);
            expect(info.due).toBe(false);
            expect(info.nextRunAt).toBe(monday10 + 7 * DAY);
        });

        it('格式非法返回错误', () => {
            const task = {
                timeSize: TaskTimeSize.week,
                timeValue: '8 10:00:00',
                lastRunTime: '',
                createTime: new Date(),
            };
            const info = calcSchedule(task, Date.now());
            expect(info.due).toBe(false);
            expect(info.error).toBeTruthy();
        });
    });

    describe('每月（此前完全未实现）', () => {
        it('当月 15 号到点后触发', () => {
            const now = localTime(2026, 3, 20, 11, 0, 0);
            const task = {
                timeSize: TaskTimeSize.month,
                timeValue: '15 10:00:00',
                lastRunTime: '2026-02-15 10:00:00',
                createTime: new Date(now),
            };
            const info = calcSchedule(task, now);
            expect(info.error).toBeUndefined();
            expect(info.due).toBe(true);
            expect(info.missed).toBe(1);
            expect(info.nextRunAt).toBe(localTime(2026, 4, 15, 10, 0, 0));
        });

        it('当月不存在的日期（如2月31号）自动回退到上月最近有效触发点', () => {
            const now = localTime(2026, 2, 28, 11, 0, 0);
            const task = {
                timeSize: TaskTimeSize.month,
                timeValue: '31 10:00:00',
                lastRunTime: '',
                createTime: new Date(now),
            };
            const info = calcSchedule(task, now);
            expect(info.error).toBeUndefined();
            expect(info.scheduledAt).toBe(localTime(2026, 1, 31, 10, 0, 0));
            expect(info.nextRunAt).toBe(localTime(2026, 3, 31, 10, 0, 0));
        });

        it('格式非法返回错误', () => {
            const task = {
                timeSize: TaskTimeSize.month,
                timeValue: '32 10:00:00',
                lastRunTime: '',
                createTime: new Date(),
            };
            const info = calcSchedule(task, Date.now());
            expect(info.due).toBe(false);
            expect(info.error).toBeTruthy();
        });
    });

    describe('单次执行', () => {
        it('未到时间不触发，到时间后触发一次', () => {
            const task = {
                timeSize: TaskTimeSize.single,
                timeValue: '2026-03-10 10:00:00',
                lastRunTime: '',
                createTime: new Date(),
            };
            const before = calcSchedule(
                task,
                localTime(2026, 3, 10, 9, 59, 59)
            );
            expect(before.due).toBe(false);
            expect(before.nextRunAt).toBe(localTime(2026, 3, 10, 10, 0, 0));

            const after = calcSchedule(task, localTime(2026, 3, 10, 10, 0, 1));
            expect(after.due).toBe(true);
            expect(after.missed).toBe(1);
        });

        it('时间格式非法返回错误', () => {
            const task = {
                timeSize: TaskTimeSize.single,
                timeValue: '2026/03/10',
                lastRunTime: '',
                createTime: new Date(),
            };
            const info = calcSchedule(task, Date.now());
            expect(info.due).toBe(false);
            expect(info.error).toBeTruthy();
        });
    });
});
