import { Repository, DeepPartial, FindOptionsWhere, FindOptionsSelect, FindOptionsOrder, FindOptionsRelations, QueryRunner } from 'typeorm';
import BaseEntity from '@fefeding/common/dist/models/base/baseORM';
import { BaseService } from './base.service';
export interface Options<Entity> {
    select?: FindOptionsSelect<Entity>;
    order?: FindOptionsOrder<Entity>;
    page?: number;
    size?: number;
    relations?: FindOptionsRelations<Entity>;
}
export declare abstract class BaseModel<K extends BaseEntity> extends BaseService {
    protected abstract model: Repository<K>;
    /**
     * 保存
     * @param u 对象orm
     */
    save(entity: K, qryRunner?: QueryRunner): Promise<K>;
    /** update 和 create都可以用insert */
    insert(data: DeepPartial<K> | DeepPartial<K>[]): Promise<K | K[]>;
    update(data: DeepPartial<K> | DeepPartial<K>[], repo?: Repository<K>): Promise<K>;
    /**
     * 删除对象
     */
    delete(data: DeepPartial<K> | DeepPartial<K>[], repo?: Repository<K>): Promise<K | DeepPartial<K>[]>;
    findAndCount(where: FindOptionsWhere<K> | FindOptionsWhere<K>[], options?: Options<K>): Promise<{
        rows: K[];
        count: number;
    }>;
}
