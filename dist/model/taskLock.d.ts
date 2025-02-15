import BaseEntity from '@fefeding/common/dist/models/base/baseORM';
export default class TaskLock extends BaseEntity {
    key: string;
    name: string;
}
export { TaskLock };
