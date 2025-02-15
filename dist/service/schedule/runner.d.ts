import { BaseService } from '../../base/base.service';
import TaskService from '../task';
import InstanceService from '../taskInstance';
import TaskLockService from '../taskLock';
export declare class RunnerService extends BaseService {
    taskService: TaskService;
    instanceService: InstanceService;
    taskLockService: TaskLockService;
    init(): Promise<void>;
    runningTaskCount: number;
    maxRunningCount: number;
    master(): Promise<void>;
    subTask(): Promise<void>;
    run(): Promise<void>;
    sleep(time?: number): Promise<void>;
}
