import { Provide, Scope, ScopeEnum } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { BaseModelService } from '@cicctencent/midwayjs-base';
import TaskLockOrm from '../model/taskLock';
import { TaskLockKeys } from '../model/taskConst';

/**
 * 任务锁
 */
@Provide()
@Scope(ScopeEnum.Singleton)
export default class TaskLockService extends BaseModelService<TaskLockOrm> {
    @InjectEntityModel(TaskLockOrm)
    protected model: Repository<TaskLockOrm>;

    /** 在指定锁中执行事务 */
    async runLock<T>(
        lockKey: TaskLockKeys,
        fun: (qryRunner: QueryRunner) => T | Promise<T>,
        qryRunner?: QueryRunner
    ): Promise<T | undefined> {
        //console.log('lock', lockKey);

        qryRunner =
            qryRunner ||
            this.model.createQueryBuilder().connection.createQueryRunner(); // ReplicationMode = "master" | "slave";

        try {
            //console.log(lockKey, ' 等待锁');

            // 开启事务
            await qryRunner.startTransaction();

            const queryBuilder = this.model.createQueryBuilder(
                'taskLock',
                qryRunner
            );

            // 锁定和等待锁
            const qry = await queryBuilder
                .where('taskLock.key=:key', {
                    key: lockKey,
                })
                .useTransaction(true)
                .setLock('pessimistic_write');

            let lock = await qry.getOne();
            if (!lock) {
                const newLock = new TaskLockOrm();
                newLock.key = lockKey;
                newLock.name = '';
                newLock.updater = newLock.creator = 'task';

                // 多节点并发首次创建锁记录时可能出现唯一键冲突，
                // 这里忽略冲突并回查，避免整个事务回滚导致调度中断
                await queryBuilder
                    .insert()
                    .into(TaskLockOrm)
                    .values(newLock)
                    .orIgnore()
                    .execute();

                lock = await qry.getOne();
            }

            //console.log(lockKey, '锁定');

            const result = await fun(qryRunner); // 当前事务中执行业务逻辑

            //console.log(lockKey, '释放锁定');
            await qryRunner.commitTransaction(); // 提交事务
            return result;
        } catch (e) {
            this.ctx?.logger?.error?.('runLock error:', e);
            try {
                await qryRunner.rollbackTransaction();
            } catch (e2) {
                // 回滚失败时忽略，避免掩盖原始异常
            }
            return undefined;
        } finally {
            await qryRunner.release();
        }
    }
}
