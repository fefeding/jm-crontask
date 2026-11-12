import { request } from './base';
import type { ApiResult } from './base';
import type { PageResult, TaskConfig, DiagnoseResult } from '@/domain/task';
import type { TaskState } from '@/base/taskConst';

/** 查询任务配置 */
export async function queryTask(params: {
    id?: number,
    name?: string,
    timeSize?: number,
    state?: TaskState,
    page?: number,
    size?: number,
}) {
    return await request<PageResult<TaskConfig>>('/api/task/query', params);
}

/** 保存任务配置 */
export async function saveTask(data: Partial<TaskConfig>) {
    return await request<TaskConfig>('/api/task/save', data);
}

/** 修改任务状态 */
export async function setTaskState(id: number, state: TaskState) {
    return await request('/api/task/setState', { id, state });
}

/** 立即执行一次 */
export async function runTask(id: number) {
    return await request('/api/task/run', { id });
}

/** 试运行返回结果（接口内层 data，request 返回的是 {ret,msg,data} 信封） */
export interface TestScriptResult {
    success: boolean;
    status: string;
    message: string;
    duration: number;
    exitCode: number;
    log: string;
}

/**
 * 试运行脚本，不落库，便于编写任务时自测
 *
 * 注意：request() 统一返回后端信封 {ret,msg,data}，这里解包出 data，
 * 否则调用方拿到的是信封对象，testResult.log / .success 等字段会取不到。
 */
export async function testScript(data: {
    script: string,
    timeout?: number,
    execType?: number,
    execCommand?: string,
    workDir?: string,
    envJson?: string,
}) {
    const res = await request<ApiResult<TestScriptResult>>('/api/task/testScript', data);
    return res.data;
}

/**
 * 任务健康度诊断
 *
 * 返回配置体检结果、运行统计、问题清单与最近执行时间线
 */
export async function diagnoseTask(id: number) {
    return await request<ApiResult<DiagnoseResult>>('/api/task/diagnose', { id });
}
