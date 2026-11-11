import * as moment from 'moment';
import { TaskTimeSize } from '../model/taskConst';

const parser = require('@hardik_sharma/cron-parser-all');

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

/** 单个任务单次补偿的最大执行次数，避免长时间停机后瞬间堆积大量实例 */
export const MAX_MISSED_COUNT = 100;

/** 计算 crontab 时最多回溯的触发点个数 */
const MAX_CRON_ITERATION = 2000;

export interface ScheduleInfo {
    /** 当前是否已到达执行时间 */
    due: boolean;
    /** 本次应执行的时间戳（毫秒） */
    scheduledAt: number;
    /** 自上次成功执行以来错过的执行次数（含本次） */
    missed: number;
    /** 下次执行时间戳（毫秒），单次任务为 0 */
    nextRunAt: number;
    /** 配置或解析错误 */
    error?: string;
}

/** 空结果 */
function empty(error?: string): ScheduleInfo {
    return { due: false, scheduledAt: 0, missed: 0, nextRunAt: 0, error };
}

/**
 * 解析时间字符串为时间戳，失败返回 0
 */
function toTimestamp(value: any): number {
    if (!value) return 0;
    if (value instanceof Date) {
        return isNaN(value.getTime()) ? 0 : value.getTime();
    }
    if (typeof value === 'number') {
        return value > 0 ? value : 0;
    }
    const str = String(value).trim();
    if (!str) return 0;
    // 兼容 'YYYY-MM-DD HH:mm:ss' 与 ISO 串
    const m = moment(
        str,
        ['YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DDTHH:mm:ss', moment.ISO_8601],
        true
    );
    if (m.isValid()) return m.valueOf();
    const m2 = moment(str);
    return m2.isValid() ? m2.valueOf() : 0;
}

/**
 * 取任务的执行基准时间（上次执行时间）。
 * 没有执行过则用创建时间作为基准，单次任务/间隔任务另行处理。
 */
function getAnchor(task: any): number {
    const last = toTimestamp(task?.lastRunTime);
    if (last > 0) return last;
    return toTimestamp(task?.createTime);
}

/**
 * 解析 "HH:mm:ss"
 */
function parseTimeOfDay(
    value: string
): { h: number; m: number; s: number } | null {
    const m = /^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/.exec(
        String(value || '').trim()
    );
    if (!m) return null;
    const h = Number(m[1]);
    const mi = Number(m[2]);
    const s = Number(m[3] || 0);
    if (h > 23 || mi > 59 || s > 59) return null;
    return { h, m: mi, s };
}

/**
 * 构造某一天的时间点
 */
function atTime(base: Date, t: { h: number; m: number; s: number }): number {
    const d = new Date(
        base.getFullYear(),
        base.getMonth(),
        base.getDate(),
        t.h,
        t.m,
        t.s,
        0
    );
    return d.getTime();
}

/**
 * 计算某个月是否存在指定日期
 */
function monthOccurrence(
    year: number,
    month0: number,
    day: number,
    t: { h: number; m: number; s: number }
): number {
    const daysInMonth = new Date(year, month0 + 1, 0).getDate();
    if (day > daysInMonth) return 0;
    return new Date(year, month0, day, t.h, t.m, t.s, 0).getTime();
}

/**
 * 读取 cron 迭代结果的时间戳
 *
 * cron-parser 的 next() 返回的是 CronDate 对象（不是标准的 IteratorResult），
 * 需要兼容 CronDate 与 IteratorResult 两种形态。
 */
function readCronTime(result: any): number {
    if (!result) return 0;
    if (typeof result.getTime === 'function') return result.getTime();
    if (result.value && typeof result.value.getTime === 'function')
        return result.value.getTime();
    return 0;
}

/**
 * 计算周期触发点的漏跑次数
 *
 * 触发点固定为每天/每周的同一时刻，因此：
 * 漏跑次数 = 跨越的周期数 + (本次触发时刻是否晚于锚点时刻 ? 1 : 0)
 *
 * 注意不能简单用 (occ - anchor) / 周期 取整 + 1，
 * 因为锚点本身就落在触发点上时（如每天 10:00 上次于 10:00 执行）会多数一次。
 */
function countPeriodicMissed(
    anchor: number,
    occ: number,
    periodDays: number
): number {
    const dayDiff = moment(occ)
        .startOf('day')
        .diff(moment(anchor).startOf('day'), 'days');
    const timeOfDay = (t: number) => {
        const m = moment(t);
        return (
            m.hours() * 3600000 +
            m.minutes() * 60000 +
            m.seconds() * 1000 +
            m.milliseconds()
        );
    };
    const periods = Math.floor(dayDiff / periodDays);
    return periods + (timeOfDay(occ) > timeOfDay(anchor) ? 1 : 0);
}

/**
 * 统一时间计算器入口
 *
 * 修复要点：
 * 1. crontab 任务以「基准时间之后、上限时间之前实际触发点数量」判定，
 *    不再依赖 lastRunTime 与 prev 的先后关系，新任务首次即可正常触发
 * 2. week / month 周期完整实现
 * 3. 统一产出 missed（漏跑次数），供补偿策略使用
 */
export function calcSchedule(
    task: any,
    now: number = Date.now()
): ScheduleInfo {
    if (!task) return empty('任务不存在');

    const timeSize = Number(task.timeSize);
    const timeValue = String(task.timeValue ?? '').trim();
    const anchor = getAnchor(task);

    switch (timeSize) {
        // ---------------------------------------------------------------
        // 单次执行
        // ---------------------------------------------------------------
        case TaskTimeSize.single: {
            // 严格解析，避免 '2026/03/10' 这类非法格式被宽松接受
            const t = moment(timeValue, 'YYYY-MM-DD HH:mm:ss', true);
            if (!timeValue || !t.isValid()) {
                return empty('单次执行时间格式错误，应为 YYYY-MM-DD HH:mm:ss');
            }
            const at = t.valueOf();
            if (now < at) {
                return {
                    due: false,
                    scheduledAt: at,
                    missed: 0,
                    nextRunAt: at,
                };
            }
            return { due: true, scheduledAt: at, missed: 1, nextRunAt: 0 };
        }

        // ---------------------------------------------------------------
        // 固定间隔（秒 / 分 / 时）
        // ---------------------------------------------------------------
        case TaskTimeSize.second:
        case TaskTimeSize.minute:
        case TaskTimeSize.hour: {
            const unit =
                timeSize === TaskTimeSize.second
                    ? SECOND
                    : timeSize === TaskTimeSize.minute
                    ? MINUTE
                    : HOUR;
            const interval = Number(timeValue) * unit;
            if (!interval || interval <= 0 || isNaN(interval)) {
                return empty('执行间隔必须为正整数');
            }

            // 从未执行过：启用后立即执行一次，之后按间隔执行
            const neverRan = toTimestamp(task?.lastRunTime) <= 0;
            if (neverRan) {
                return {
                    due: true,
                    scheduledAt: now,
                    missed: 1,
                    nextRunAt: now + interval,
                };
            }

            const base = toTimestamp(task.lastRunTime);
            const elapsed = now - base;
            if (elapsed < interval) {
                return {
                    due: false,
                    scheduledAt: base + interval,
                    missed: 0,
                    nextRunAt: base + interval,
                };
            }
            const missed = Math.min(
                Math.floor(elapsed / interval),
                MAX_MISSED_COUNT
            );
            return {
                due: true,
                scheduledAt: base + missed * interval,
                missed,
                nextRunAt: base + (missed + 1) * interval,
            };
        }

        // ---------------------------------------------------------------
        // 每天 HH:mm:ss
        // ---------------------------------------------------------------
        case TaskTimeSize.day: {
            const t = parseTimeOfDay(timeValue);
            if (!t) return empty('每天执行时间格式错误，应为 HH:mm:ss');

            const nowDate = new Date(now);
            let occ = atTime(nowDate, t);
            if (occ > now) {
                occ = atTime(new Date(now - DAY), t);
            }

            const base = anchor || occ;
            if (occ <= base) {
                return {
                    due: false,
                    scheduledAt: occ,
                    missed: 0,
                    nextRunAt: occ + DAY,
                };
            }
            const missed = Math.min(
                countPeriodicMissed(base, occ, 1),
                MAX_MISSED_COUNT
            );
            return {
                due: true,
                scheduledAt: occ,
                missed,
                nextRunAt: occ + DAY,
            };
        }

        // ---------------------------------------------------------------
        // 每周  "星期(1-7,1=周一) HH:mm:ss"
        // ---------------------------------------------------------------
        case TaskTimeSize.week: {
            const m = /^(\d)\s+(\d{1,2}:\d{1,2}(?::\d{1,2})?)$/.exec(timeValue);
            if (!m)
                return empty(
                    '每周执行时间格式错误，应为 "星期 HH:mm:ss"，如 "1 10:00:00"'
                );
            const weekday = Number(m[1]);
            if (weekday < 1 || weekday > 7) return empty('星期取值范围为 1-7');
            const t = parseTimeOfDay(m[2]);
            if (!t)
                return empty(
                    '每周执行时间格式错误，应为 "星期 HH:mm:ss"，如 "1 10:00:00"'
                );

            const nowDate = new Date(now);
            // 本周周一 0 点
            const monday = new Date(
                nowDate.getFullYear(),
                nowDate.getMonth(),
                nowDate.getDate()
            );
            const offset = (nowDate.getDay() + 6) % 7; // 周一为 0
            monday.setDate(monday.getDate() - offset);

            let occ = atTime(
                new Date(monday.getTime() + (weekday - 1) * DAY),
                t
            );
            if (occ > now) {
                occ = atTime(
                    new Date(monday.getTime() - WEEK + (weekday - 1) * DAY),
                    t
                );
            }

            const base = anchor || occ;
            if (occ <= base) {
                return {
                    due: false,
                    scheduledAt: occ,
                    missed: 0,
                    nextRunAt: occ + WEEK,
                };
            }
            const missed = Math.min(
                countPeriodicMissed(base, occ, 7),
                MAX_MISSED_COUNT
            );
            return {
                due: true,
                scheduledAt: occ,
                missed,
                nextRunAt: occ + WEEK,
            };
        }

        // ---------------------------------------------------------------
        // 每月  "几号(1-31) HH:mm:ss"
        // ---------------------------------------------------------------
        case TaskTimeSize.month: {
            const m = /^(\d{1,2})\s+(\d{1,2}:\d{1,2}(?::\d{1,2})?)$/.exec(
                timeValue
            );
            if (!m)
                return empty(
                    '每月执行时间格式错误，应为 "几号 HH:mm:ss"，如 "15 10:00:00"'
                );
            const day = Number(m[1]);
            if (day < 1 || day > 31) return empty('每月几号取值范围为 1-31');
            const t = parseTimeOfDay(m[2]);
            if (!t)
                return empty(
                    '每月执行时间格式错误，应为 "几号 HH:mm:ss"，如 "15 10:00:00"'
                );

            // 向前回溯最多 240 个月，找到最近一次有效触发点
            let occ = 0;
            const nowDate = new Date(now);
            for (let i = 0; i < 240; i++) {
                const d = new Date(
                    nowDate.getFullYear(),
                    nowDate.getMonth() - i,
                    1
                );
                const at = monthOccurrence(
                    d.getFullYear(),
                    d.getMonth(),
                    day,
                    t
                );
                if (at && at <= now) {
                    occ = at;
                    break;
                }
            }
            if (!occ) {
                return empty('未找到有效的每月执行时间点');
            }

            // 向前寻找下一次触发点
            let next = 0;
            for (let i = 0; i < 240; i++) {
                const d = new Date(
                    nowDate.getFullYear(),
                    nowDate.getMonth() + i,
                    1
                );
                const at = monthOccurrence(
                    d.getFullYear(),
                    d.getMonth(),
                    day,
                    t
                );
                if (at && at > now) {
                    next = at;
                    break;
                }
            }

            const base = anchor || occ;
            if (occ <= base) {
                return {
                    due: false,
                    scheduledAt: occ,
                    missed: 0,
                    nextRunAt: next,
                };
            }

            // 按月跨度统计漏跑次数
            let missed = 0;
            let cursor = new Date(base);
            const endDate = new Date(occ);
            for (let i = 0; i < 240; i++) {
                const at = monthOccurrence(
                    cursor.getFullYear(),
                    cursor.getMonth(),
                    day,
                    t
                );
                if (at && at > base && at <= occ) {
                    missed++;
                }
                cursor = new Date(
                    cursor.getFullYear(),
                    cursor.getMonth() + 1,
                    1
                );
                if (cursor.getTime() > endDate.getTime()) break;
            }
            missed = Math.min(missed, MAX_MISSED_COUNT);

            return {
                due: true,
                scheduledAt: occ,
                missed,
                nextRunAt: next,
            };
        }

        // ---------------------------------------------------------------
        // crontab 规则
        // ---------------------------------------------------------------
        case TaskTimeSize.crontab: {
            if (!timeValue) return empty('定时规则不能为空');
            const base = anchor || now;
            let iterator: any;
            try {
                iterator = parser.parseExpression(timeValue, {
                    currentDate: new Date(base),
                    tz: 'Asia/Shanghai',
                });
            } catch (e) {
                return empty(`定时规则解析失败: ${(e as Error).message}`);
            }

            let missed = 0;
            let last = 0;
            let cur = iterator.next();
            let curTime = readCronTime(cur);
            while (
                curTime > 0 &&
                curTime <= now &&
                missed < MAX_CRON_ITERATION
            ) {
                missed++;
                last = curTime;
                cur = iterator.next();
                curTime = readCronTime(cur);
            }

            // 下次触发点
            const nextRunAt = curTime > 0 ? curTime : 0;

            if (missed <= 0) {
                return { due: false, scheduledAt: 0, missed: 0, nextRunAt };
            }
            return {
                due: true,
                scheduledAt: last,
                missed: Math.min(missed, MAX_MISSED_COUNT),
                nextRunAt,
            };
        }
    }

    return empty('未知的执行时间类型');
}

/**
 * 计算下次唤醒时间：所有任务中最早的那个
 */
export function calcNextWakeAt(
    schedules: ScheduleInfo[],
    now: number = Date.now()
): number {
    let next = 0;
    for (const s of schedules) {
        if (!s || s.error) continue;
        if (s.nextRunAt > 0 && (next === 0 || s.nextRunAt < next)) {
            next = s.nextRunAt;
        }
    }
    return next > 0 ? next : now;
}
