import {request} from './base';

/** 任务统计数据 */
export interface TaskStatistics {
  totalTasks: number;
  runningTasks: number;
  completedTasks: number;
  failedTasks: number;
  timeoutTasks?: number;
  pendingTasks?: number;
  totalInstances?: number;
  successRate?: number;
  failed24h?: number;
}

/** 系统信息 */
export interface SystemInfo {
  version: string;
  uptime: string;
  nodeVersion: string;
  memoryUsage: string;
  platform?: string;
}

/** 最近任务条目 */
export interface RecentTask {
  id: number;
  taskId?: number;
  name: string;
  executeTime: string;
  status: string;
  duration: string;
  exitCode?: number;
}

/**
 * 获取任务统计数据
 */
export const getTaskStatistics = () => {
  return request<{ success: boolean, data: TaskStatistics }>({
    url: '/api/admin/dashboard/task/statistics',
    method: 'GET'
  });
};

/**
 * 获取系统信息
 */
export const getSystemInfo = () => {
  return request<{ success: boolean, data: SystemInfo }>({
    url: '/api/admin/dashboard/system/info',
    method: 'GET'
  });
};

/**
 * 获取最近任务列表
 */
export const getRecentTasks = () => {
  return request<{ success: boolean, data: RecentTask[] }>({
    url: '/api/admin/dashboard/task/recent',
    method: 'GET'
  });
};
