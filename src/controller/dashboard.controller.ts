import { Controller, Get, Inject } from '@midwayjs/core';
import { BaseController, decorators } from '@cicctencent/midwayjs-base';
import TaskService from '../service/task';
import TaskInstanceService from '../service/taskInstance';
import { TaskStatus } from '../model/taskConst';

/**
 * 仪表板控制器
 */
@Controller('/api/admin/dashboard')
export class DashboardController extends BaseController {

  @Inject()
  taskService: TaskService;

  @Inject()
  taskInstanceService: TaskInstanceService;

  /**
   * 获取任务统计数据
   */
  @decorators.checkApiToken(false)
  @decorators.checkLogin(true)
  @Get('/task/statistics')
  async getTaskStatistics() {
    try {
      // 获取所有任务配置
      const tasksResult = await this.taskService.query({});
      const tasks = tasksResult.data || [];
      
      // 获取最近的任务实例来统计状态
      const instancesResult = await this.taskInstanceService.query({
        size: 1000,
        page: 1
      });
      const instances = instancesResult.data || [];
      
      // 统计各种状态
      const totalTasks = tasks.length;
      const runningTasks = instances.filter(i => i.status === TaskStatus.running).length;
      const completedTasks = instances.filter(i => i.status === TaskStatus.success).length;
      const failedTasks = instances.filter(i => i.status === TaskStatus.failed).length;
      
      return {
        success: true,
        data: {
          totalTasks,
          runningTasks,
          completedTasks,
          failedTasks
        }
      };
    } catch (error) {
      console.error('获取任务统计失败:', error);
      return {
        success: false,
        message: '获取统计数据失败'
      };
    }
  }

  /**
   * 获取系统信息
   */
  @decorators.checkApiToken(false)
  @decorators.checkLogin(true)
  @Get('/system/info')
  async getSystemInfo() {
    try {
      const uptime = process.uptime();
      const days = Math.floor(uptime / (24 * 60 * 60));
      const hours = Math.floor((uptime % (24 * 60 * 60)) / (60 * 60));
      
      const memoryUsage = process.memoryUsage();
      const memoryUsedInMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
      
      return {
        success: true,
        data: {
          version: '1.0.0',
          uptime: `${days}天 ${hours}小时`,
          nodeVersion: process.version,
          memoryUsage: `${memoryUsedInMB}MB`
        }
      };
    } catch (error) {
      console.error('获取系统信息失败:', error);
      return {
        success: false,
        message: '获取系统信息失败'
      };
    }
  }

  /**
   * 获取最近任务列表
   */
  @decorators.checkApiToken(false)
  @decorators.checkLogin(true)
  @Get('/task/recent')
  async getRecentTasks() {
    try {
      const instancesResult = await this.taskInstanceService.query({
        size: 10,
        page: 1
      });
      
      const instances = instancesResult.data || [];
      
      // 格式化数据
      const formattedTasks = instances.map(instance => ({
        id: instance.id,
        name: instance.taskName || '未知任务',
        executeTime: instance.startTime ? new Date(instance.startTime).toLocaleString('zh-CN') : '-',
        status: this.getStatusText(instance.status),
        duration: instance.duration ? `${instance.duration}秒` : '-'
      }));
      
      return {
        success: true,
        data: formattedTasks
      };
    } catch (error) {
      console.error('获取最近任务失败:', error);
      return {
        success: false,
        message: '获取最近任务失败'
      };
    }
  }

  /**
   * 获取状态文本
   */
  private getStatusText(status: number): string {
    switch (status) {
      case TaskStatus.running:
        return 'running';
      case TaskStatus.success:
        return 'completed';
      case TaskStatus.failed:
        return 'failed';
      default:
        return 'pending';
    }
  }
}