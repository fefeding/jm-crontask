import { request } from './base';
import type { PageResult, TaskInstance } from '@/domain/task';
import type { TaskStatus } from '@/base/taskConst';

/** 查询任务实例 */
export async function queryInstance(params: {
    taskId?: number,
    status?: TaskStatus,
    execStartTime?: string,
    execEndTime?: string,
    page?: number,
    size?: number,
}) {
    return await request<PageResult<TaskInstance>>('/api/instance/query', params);
}

/** 获取实例详情（含日志） */
export async function getInstance(id: number) {
    return await request<TaskInstance>('/api/instance/get', { id });
}

/** 修改实例状态 */
export async function updateInstanceStatus(id: number, status: TaskStatus) {
    return await request('/api/instance/updateStatus', { id, status });
}

/** 人工终止正在运行的实例 */
export async function killInstance(id: number) {
    return await request('/api/instance/kill', { id });
}
