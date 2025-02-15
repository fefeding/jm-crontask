import { Repository, QueryRunner } from 'typeorm';
import { BaseModel } from '../base/base.model';
import TaskLockOrm from '../model/taskLock';
import { TaskLockKeys } from '../model/taskConst';
/**
 * 任务锁
 */
export default class TaskLockService extends BaseModel<TaskLockOrm> {
    protected model: Repository<TaskLockOrm>;
    /** 在指定锁中执行事务 */
    runLock(lockKey: TaskLockKeys, fun: Function, qryRunner?: QueryRunner): Promise<any>;
}
