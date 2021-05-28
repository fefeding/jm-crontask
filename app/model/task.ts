

import decorators from '../lib/decorator';
import {Request} from './interface/request';
import {Response} from './interface/response';
import { PageRequest, PageResponse } from './interface/pagination';
import { TaskTimeSize, TaskState } from './taskConst';

export interface TaskConfig {
    
        id: number;
    
        
        name: string;
    
        
        description: string;
    
        
        script: string;
    
        
        timeSize: TaskTimeSize;
    
        
        state: TaskState;
    
        /**
         * 当为单次执行时，就是一个具体的时间，  
         * 当为每天时，这里可以指定具体几点几分几秒执行
         * 当为每秒、分、时。这个值不采用，循环执行
         */
        
        timeValue: string;
    
        
        lastRunTime: string;
}

/**
 * 分页查询任务配置
 */
@decorators.api({
    url: '/api/task/query'
})
export class TaskConfigPaginationRequest extends PageRequest {
    id?: number = 0;
    name?: string = "";
    state?: TaskState = TaskState.init;
    timeSize?: TaskTimeSize;
}
/**
 * 查询结果
 */
export class TaskConfigPaginationResponse extends PageResponse<TaskConfig> {

}

/**
 * 新增任务配置
 */
@decorators.api({
    url: '/api/task/save'
})
export class TaskConfigSaveRequest extends Request {
    id: number = 0;

    name: string = "";

    description: string = "";

    script: string = "";

    timeSize: TaskTimeSize;

    timeValue:string = "";

    watcher: string = "";
}

export class TaskConfigSaveResponse extends Response {

}