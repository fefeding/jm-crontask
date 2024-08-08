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