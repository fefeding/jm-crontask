import {
    Repository,
    DeepPartial,
    FindOptionsWhere,
    FindOptionsSelect,
    FindOptionsOrder,
    FindOptionsRelations,
} from 'typeorm';
//import { ICommonReturn } from '../interface/common/index';
import BaseEntity from '@fefeding/common/dist/models/base/baseORM';
import { BaseService } from './base.service';
import { EValid } from '@fefeding/common/dist/models/base/enumType';

export interface Options<Entity> {
    select?: FindOptionsSelect<Entity>;

    order?: FindOptionsOrder<Entity>;

    page?: number;

    size?: number;

    relations?: FindOptionsRelations<Entity>;
}

export abstract class BaseModel<K extends BaseEntity> extends BaseService {
    protected abstract model: Repository<K>;

    /**
     * 保存
     * @param u 对象orm
     */
    async save(entity: K) {
        const res = await this.model.save(entity);
        return res;
    }

    /** update 和 create都可以用insert */
    public async insert(
        data: DeepPartial<K> | DeepPartial<K>[]
    ): Promise<K | K[]> {
        const isArray = Array.isArray(data);
        const updater = this.ctx.currentSession?.loginId;
        const entities = (isArray ? data : [data]).map(it =>
            this.model.create({
                /** creator 优先用it的，updater优先用当前用户的 */
                creator: updater,
                ...it,
                updater,
            })
        );
        const models = await this.model.save(entities);
        return isArray ? models : models[0];
    }

    public async update(
        data: DeepPartial<K> | DeepPartial<K>[],
        repo?: Repository<K>
    ): Promise<K> {
        let entities;
        let isArray = false;
        if (Array.isArray(data)) {
            isArray = true;
            entities = data;
        } else {
            entities = [data];
        }
        const updater = this.ctx.currentSession?.loginId;
        repo = repo || this.model;

        const models = await repo.save(
            entities.map(o => {
                return this.model.create({
                    ...o,
                    updater,
                });
            })
        );
        return isArray ? models : models[0];
    }

    /**
     * 删除对象
     */
    public async delete(
        data: DeepPartial<K> | DeepPartial<K>[],
        repo?: Repository<K>) {
            repo = repo || this.model;
        if(Array.isArray(data)) {
            for(const m of data) {
                await this.delete(m, repo);
            }   
            return data;         
        }
        else {
            // 标记为已删除
            data.valid = EValid.Unvalid;
            return await repo.save(data);
        }
    }

    public async findAndCount(
        where: FindOptionsWhere<K> | FindOptionsWhere<K>[],
        options?: Options<K>
    ): Promise<{ rows: K[]; count: number }> {
        const {
            select,
            order = { createTime: 'DESC' } as FindOptionsOrder<K>,
            page = 1,
            size = 20,
            relations,
        } = options || {};
        const skip = (Number(page) - 1) * Number(size);
        let take = Number(size);
        if(take > 10000) take = 10000;

        console.log('find count', where, skip, take);

        const [rows, count] = await Promise.all([
            this.model.find({ where, select, order, skip, take, relations }),
            this.model.countBy(where),
        ]);

        return { rows, count };
    }
}
