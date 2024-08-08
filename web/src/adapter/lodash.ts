export { cloneDeep, isEqual, set, get } from 'lodash-es';
// 和lodash的toPlainObject不太一样
export function toPlainObject(obj: Record<string, any>) {
    try {
        return JSON.parse(JSON.stringify(obj));
    } catch (e) {
        return {};
    }
}
