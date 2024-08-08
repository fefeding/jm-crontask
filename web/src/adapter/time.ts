// 时间相关工具
import dayjs from 'dayjs';
import calendar from 'dayjs/plugin/calendar';
dayjs.extend(calendar);
/**
 * 获取年龄
 * @param birth 生日
 * @param current 当前时间
 */

export function getOld(birth: number | string, current?: number | string) {
    return dayjs(current ? getTime(current) : new Date()).diff(
        dayjs(getTime(birth)),
        'year'
    );
}
/**
 * 获取时间戳
 *
 * @param {string} val 后台返回的日期
 * @returns
 */
export function getTime(val?: number | string | Date): number {
    if (typeof val === 'number') {
        return new Date(val).getTime();
    }
    if (val) {
        if (val instanceof Date) {
            return val.getTime();
        }
        // 处理后台日期格式为2022-07-07T09:10:31.950Z
        else if (val.includes('T')) {
            return new Date(val).getTime();
        }
        // 在IOS中Date对象不能处理'2018.02.23' '2018-02-23 20:20:00'这种形式的日志，可以处理'2018/02/23'
        return val ? new Date(val.replace(/[.-]/g, '/')).getTime() : Date.now();
    } else {
        return -1;
    }
}

/**
 * 获取时间戳
 *
 * @param {string} val 后台返回的日期
 * @returns
 */
export function format(
    val?: number | string | Date,
    template?: string
): string {
    return dayjs(getTime(val)).format(template || 'M月D日');
}

export default {
    getOld,
    getTime,
    format,
};

export class Time {
    private day: dayjs.Dayjs;
    constructor(val: string | number | Date | undefined) {
        this.day = dayjs(getTime(val));
    }

    /**
     * 获取时间戳
     *
     * @param {string} val 后台返回的日期
     * @returns
     */
    format(template?: string): string {
        return this.day.format(template || 'M月D日');
    }
    /**
     *指示Day.js对象是否在另一个提供的date-time之前
     * @param {string} val 比较的日期
     * @param {string} compareVal 被比较的日期
     * @param {"year"|"month"} type 比较的单位
     * @returns
     */
    isBefore(compareVal: string | number | Date, type: 'year' | 'month') {
        return this.day.isBefore(compareVal, type);
    }
    /**
     * 指示Day.js对象是否在另一个提供的date-time之后
     *@param {string} val 比较的日期
     * @param {string} compareVal 被比较的日期
     * @param {"year"|"month"} type 比较的单位
     * @returns
     */
    isAfter(compareVal: string | number | Date, type: 'year' | 'month') {
        return this.day.isAfter(compareVal, type);
    }
    /**
     * 日历添加.calendar API来返回一个string来显示日历时间
     *@param {Object} obj 日历格式
     *@param {Record<string, any>} obj 日期
     * @returns
     */
    calendar(
        obj = {
            sameDay: '[今天] HH:mm',
            lastDay: '[昨天] HH:mm',
            nextDay: 'MM/DD HH:mm',
            lastWeek: 'MM/DD HH:mm',
            nextWeek: 'MM/DD HH:mm',
            sameElse: 'MM/DD HH:mm',
        } as Record<string, any>
    ) {
        return this.day.calendar(null, obj);
    }
}
