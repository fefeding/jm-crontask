import {request} from './base';

/**
 * 获取任务统计数据
 */
export const getTaskStatistics = () => {
  return request({
    url: '/api/admin/dashboard/task/statistics',
    method: 'GET'
  });
};

/**
 * 获取系统信息
 */
export const getSystemInfo = () => {
  return request({
    url: '/api/admin/dashboard/system/info',
    method: 'GET'
  });
};

/**
 * 获取最近任务列表
 */
export const getRecentTasks = () => {
  return request({
    url: '/api/admin/dashboard/task/recent',
    method: 'GET'
  });
};