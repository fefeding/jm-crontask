import { Provide, Scope, ScopeEnum } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { BaseModelService } from '@cicctencent/midwayjs-base';
import { TaskConfig } from '../model/taskConfig';
import { TaskInstance } from '../model/taskInstance';
import { TaskState, TaskStatus } from '../model/taskConst';
import { QueryRunner, Repository } from 'typeorm';
import { calcSchedule, ScheduleInfo } from '../lib/time-calculator';

/**
 * 任务服务
 */
@Provide()
@Scope(ScopeEnum.Request, { allowDowngrade: true })
export default class TaskService extends BaseModelService<TaskConfig> {
    @InjectEntityModel(TaskConfig)
    protected model: Repository<TaskConfig>;

    // 通过ID获取
    async getById(id: number) {
        const task = await this.model.findOneBy({
            id,
        });
        return task;
    }

    // 检索
    async query(params: any) {
        const strWhere = ['1=1'];
        const whereParams = {} as any;
        if (params.name) {
            strWhere.push('and TaskConfig.name like :name');
            whereParams['name'] = `%${params.name}%`;
        }
        if (params.timeSize) {
            strWhere.push('and TaskConfig.timeSize = :timeSize');
            whereParams['timeSize'] = params.timeSize;
        }
        if (params.state > 0) {
            strWhere.push('and TaskConfig.state = :state');
            whereParams['state'] = params.state;
        }
        if (params.id > 0) {
            strWhere.push('and TaskConfig.id = :id');
            whereParams['id'] = params.id;
        }

        params.size = Math.min(params.size || 20, 100);
        const skip = ((params.page || 1) - 1) * params.size || 0;

        const qry = this.model
            .createQueryBuilder('TaskConfig')
            .where(strWhere.join(' '), whereParams)
            .addOrderBy('TaskConfig.state', 'ASC')
            .addOrderBy('TaskConfig.lastRunTime', 'DESC')
            .skip(skip)
            .take(params.size);

        const [data, count] = await qry.getManyAndCount();

        return {
            data,
            total: count,
        };
    }

    /**
     * 查询所有处于启用状态的任务
     *
     * 只做单表轻量查询，避免此前每次调度都全表 LEFT JOIN 实例表
     */
    async getActiveTasks(qryRunner: QueryRunner) {
        const queryBuilder = this.model.createQueryBuilder('task', qryRunner);
        const qry = queryBuilder.where('task.state=:state and task.Fvalid=1', {
            state: TaskState.start,
        });

        return await qry.getMany();
    }

    /**
     * 计算当前到期、需要执行的任务
     */
    async getDueTasks(qryRunner: QueryRunner, now: number = Date.now()) {
        const tasks = await this.getActiveTasks(qryRunner);

        const due: TaskConfig[] = [];
        const schedules = new Map<number, ScheduleInfo>();
        const invalid: { task: TaskConfig; error: string }[] = [];

        for (const task of tasks) {
            const info = calcSchedule(task, now);
            schedules.set(task.id, info);
            if (info.error) {
                invalid.push({ task, error: info.error });
                continue;
            }
            if (info.due) {
                due.push(task);
            }
        }

        // 排除已有待执行/执行中实例的任务，避免同一任务并发重复创建实例
        const busy = await this.getBusyTaskIds(due, qryRunner);
        const result = due.filter(task => !busy.has(task.id));

        return { tasks: result, schedules, invalid };
    }

    /**
     * 批量查询处于待执行/执行中的任务ID
     */
    private async getBusyTaskIds(tasks: TaskConfig[], qryRunner: QueryRunner) {
        const busy = new Set<number>();
        if (!tasks.length) return busy;

        const ids = tasks.map(t => t.id);
        const repo = this.model.manager.getRepository(TaskInstance);
        const queryBuilder = repo.createQueryBuilder('instance', qryRunner);
        const rows = await queryBuilder
            .select('instance.taskId', 'taskId')
            .where('instance.taskId IN (:...ids)', { ids })
            .andWhere('instance.status IN (:...statuses)', {
                statuses: [TaskStatus.init, TaskStatus.running],
            })
            .getRawMany();

        for (const row of rows) {
            if (row && row.taskId !== undefined && row.taskId !== null) {
                busy.add(Number(row.taskId));
            }
        }
        return busy;
    }

    /**
     * 供外部（调度器）计算单个任务的调度信息
     */
    calcTaskSchedule(task: TaskConfig, now: number = Date.now()): ScheduleInfo {
        return calcSchedule(task, now);
    }
}
