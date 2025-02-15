"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseModel = void 0;
const base_service_1 = require("./base.service");
const enumType_1 = require("@fefeding/common/dist/models/base/enumType");
class BaseModel extends base_service_1.BaseService {
    /**
     * 保存
     * @param u 对象orm
     */
    async save(entity, qryRunner) {
        if (this.ctx?.currentSession?.loginId) {
            entity.updater = this.ctx.currentSession.loginId;
        }
        if (qryRunner) {
            return await qryRunner.manager.save(entity);
        }
        const res = await this.model.save(entity);
        return res;
    }
    /** update 和 create都可以用insert */
    async insert(data) {
        const isArray = Array.isArray(data);
        const updater = this.ctx.currentSession?.loginId;
        const entities = (isArray ? data : [data]).map(it => this.model.create({
            /** creator 优先用it的，updater优先用当前用户的 */
            creator: updater,
            ...it,
            updater,
        }));
        const models = await this.model.save(entities);
        return isArray ? models : models[0];
    }
    async update(data, repo) {
        let entities;
        let isArray = false;
        if (Array.isArray(data)) {
            isArray = true;
            entities = data;
        }
        else {
            entities = [data];
        }
        const updater = this.ctx.currentSession?.loginId;
        repo = repo || this.model;
        const models = await repo.save(entities.map(o => {
            return this.model.create({
                ...o,
                updater,
            });
        }));
        return isArray ? models : models[0];
    }
    /**
     * 删除对象
     */
    async delete(data, repo) {
        repo = repo || this.model;
        if (Array.isArray(data)) {
            for (const m of data) {
                await this.delete(m, repo);
            }
            return data;
        }
        else {
            // 标记为已删除
            data.valid = enumType_1.EValid.Unvalid;
            return await repo.save(data);
        }
    }
    async findAndCount(where, options) {
        const { select, order = { createTime: 'DESC' }, page = 1, size = 20, relations, } = options || {};
        const skip = (Number(page) - 1) * Number(size);
        let take = Number(size);
        if (take > 10000)
            take = 10000;
        console.log('find count', where, skip, take);
        const [rows, count] = await Promise.all([
            this.model.find({ where, select, order, skip, take, relations }),
            this.model.countBy(where),
        ]);
        return { rows, count };
    }
}
exports.BaseModel = BaseModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS5tb2RlbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9iYXNlL2Jhc2UubW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBV0EsaURBQTZDO0FBQzdDLHlFQUFvRTtBQWNwRSxNQUFzQixTQUFnQyxTQUFRLDBCQUFXO0lBR3JFOzs7T0FHRztJQUNILEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBUyxFQUFFLFNBQXVCO1FBQ3pDLElBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxjQUFjLEVBQUUsT0FBTyxFQUFFO1lBQ2xDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDO1NBQ3BEO1FBQ0QsSUFBRyxTQUFTLEVBQUU7WUFDVixPQUFPLE1BQU0sU0FBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDL0M7UUFDRCxNQUFNLEdBQUcsR0FBRyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzFDLE9BQU8sR0FBRyxDQUFDO0lBQ2YsQ0FBQztJQUVELGdDQUFnQztJQUN6QixLQUFLLENBQUMsTUFBTSxDQUNmLElBQXVDO1FBRXZDLE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDcEMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsT0FBTyxDQUFDO1FBQ2pELE1BQU0sUUFBUSxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FDaEQsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7WUFDZCxxQ0FBcUM7WUFDckMsT0FBTyxFQUFFLE9BQU87WUFDaEIsR0FBRyxFQUFF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