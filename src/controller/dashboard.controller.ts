import { Controller, Get, Inject } from '@midwayjs/core';
import { BaseController, decorators } from '@cicctencent/midwayjs-base';
import TaskService from '../service/task';
import TaskInstanceService from '../service/taskInstance';
import { TaskStatus } from '../model/taskConst';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import TaskInstanceOrm from '../model/taskInstance';

/**
 * 仪表板控制器
 */
@Controller('/api/admin/dashboard')
export class DashboardController extends BaseController {
    @Inject()
    taskService: TaskService;

    @Inject()
    taskInstanceService: TaskInstanceService;

    @InjectEntityModel(TaskInstanceOrm)
    protected instanceModel: Repository<TaskInstanceOrm>;

    /**
     * 获取任务统计数据
     *
     * 此前是拉取 1000 条实例在内存里过滤统计，规模上来后非常慢，
     * 这里改为 SQL 聚合统计。
     */
    @decorators.checkApiToken(false)
    @decorators.checkLogin(true)
    @Get('/task/statistics')
    async getTaskStatistics() {
        try {
            // 实例状态统计：SQL 聚合
            const statusRows = await this.instanceModel
                .createQueryBuilder('instance')
                .select('instance.status', 'status')
                .addSelect('COUNT(1)', 'count')
                .groupBy('instance.status')
                .getRawMany();

            const countByStatus: Record<number, number> = {};
            for (const row of statusRows) {
                countByStatus[Number(row.status)] = Number(row.count);
            }

            // 任务配置数量
            const tasksResult = await this.taskService.query({
                size: 1,
                page: 1,
            });
            const totalTasks = Number(tasksResult?.total || 0);

            // 最近 24 小时失败数
            const failed24h = await this.instanceModel
                .createQueryBuilder('instance')
                .where('instance.status = :status', {
                    status: TaskStatus.failed,
                })
                .andWhere('instance.execStartTime >= :from', {
                    from: new Date(Date.now() - 24 * 3600 * 1000)
                        .toLocaleString('zh-CN')
                        .replace(/\//g, '-'),
                })
                .getCount();

            const totalInstances = Object.values(countByStatus).reduce(
                (a: number, b) => a + b,
                0
            );
            const successCount = countByStatus[TaskStatus.success] || 0;
            const failedCount = countByStatus[TaskStatus.failed] || 0;
            const timeoutCount = countByStatus[TaskStatus.timeout] || 0;
            const runningCount = countByStatus[TaskStatus.running] || 0;

            return {
                success: true,
                data: {
                    totalTasks,
                    runningTasks: runningCount,
                    completedTasks: successCount,
                    failedTasks: failedCount,
                    timeoutTasks: timeoutCount,
                    pendingTasks: countByStatus[TaskStatus.init] || 0,
                    totalInstances,
                    // 成功率（排除运行中）
                    successRate:
                        totalInstances - runningCount > 0
                            ? Number(
                                  (
                                      (successCount /
                                          (totalInstances - runningCount)) *
                                      100
                                  ).toFixed(2)
                              )
                            : 0,
                    failed24h,
                },
            };
        } catch (error) {
            console.error('获取任务统计失败:', error);
            return {
                success: false,
                message: '获取统计数据失败',
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
            const memoryUsedInMB = Math.round(
                memoryUsage.heapUsed / 1024 / 1024
            );

            return {
                success: true,
                data: {
                    version: '2.0.0',
                    uptime: `${days}天 ${hours}小时`,
                    nodeVersion: process.version,
                    memoryUsage: `${memoryUsedInMB}MB`,
                    platform: process.platform,
                },
            };
        } catch (error) {
            console.error('获取系统信息失败:', error);
            return {
                success: false,
                message: '获取系统信息失败',
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
                page: 1,
            });

            const instances = instancesResult?.data || [];

            // 修正字段名：实例记录中使用的是 execStartTime / duration
            const formattedTasks = instances.map((instance: any) => ({
                id: instance.id,
                name: instance.taskName || '未知任务',
                taskId: instance.taskId,
                executeTime: instance.execStartTime || '-',
                status: this.getStatusText(instance.status),
                duration: instance.duration
                    ? `${Math.round(Number(instance.duration) / 1000)}秒`
                    : '-',
                exitCode: instance.exitCode,
            }));

            return {
                success: true,
                data: formattedTasks,
            };
        } catch (error) {
            console.error('获取最近任务失败:', error);
            return {
                success: false,
                message: '获取最近任务失败',
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
            case TaskStatus.timeout:
                return 'timeout';
            default:
                return 'pending';
        }
    }
}
