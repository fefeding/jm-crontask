import BaseEntity from '@fefeding/common/dist/models/base/baseORM';
import { TaskStatus } from './taskConst';
export default class TaskInstance extends BaseEntity {
    id: number;
    taskId: number;
    execServer: string;
    execStartTime: string;
    execEndTime: string;
    status: TaskStatus;
    log: string;
}
export { TaskInstance };
