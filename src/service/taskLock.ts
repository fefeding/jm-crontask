import { Provide, Scope, ScopeEnum } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { BaseModel } from '../base/base.model';
import TaskLockOrm from '../model/taskLock';
import { TaskLockKeys } from '../model/taskConst';

/**
 * 任务锁
 */
@Provide()
@Scope(ScopeEnum.Singleton)
export default class TaskLockService extends BaseModel<TaskLockOrm> {

    @InjectEntityModel(TaskLockOrm)
    protected model: Repository<TaskLockOrm>;


    /** 在指定锁中执行事务 */
    async runLock(lockKey: TaskLockKeys, fun: Function, qryRunner?: QueryRunner) {
        console.log('lock', lockKey);

        qryRunner = qryRunner || this.model.createQueryBuilder().connection.createQueryRunner();// ReplicationMode = "master" | "slave";

        try {
            //console.log(lockKey, ' 等待锁');

            // 开启事务
            await qryRunner.startTransaction();            

            const queryBuilder = this.model.createQueryBuilder('taskLock', qryRunner);

            // 锁定和等待锁
            const qry = await queryBuilder.where('taskLock.key=:key', {
                key: lockKey
            })
            .useTransaction(true)
            .setLock('pessimistic_write');
            
            let lock = await qry.getOne();
            if(!lock) {
                const newLock = new TaskLockOrm();
                newLock.key = lockKey;
                newLock.name = '';
                newLock.updater = newLock.creator = 'task';

                const ret = await queryBuilder.insert().into(TaskLockOrm).values(newLock).execute();
                console.log('增加锁数据', lockKey, ret);

                lock = await qry.getOne();
            }
            
            //console.log(lockKey, '锁定');

            const result = await fun(qryRunner);// 当前事务中执行业务逻辑

            //console.log(lockKey, '释放锁定');
            await qryRunner.commitTransaction();// 提交事务
            return result;
        }
        catch(e) {
            console.log(e);
            this.ctx.log.error('runLock error:',e)
            await qryRunner.rollbackTransaction();
        }
        finally {
            await qryRunner.release();
        }
    }
}