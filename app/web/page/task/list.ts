import { action } from 'commander';
import { Vue, Component, Emit } from 'vue-property-decorator';
import { TaskConfigPaginationRequest, TaskConfigPaginationResponse, TaskConfigSaveRequest, TaskConfigSaveResponse} from '../../../model/task';
import {TaskState, TaskTimeSize} from '../../../model/taskConst';

import editTask from './edit';

@Component({
    components: {
        editTask,
    }
})
export default class TaskView extends Vue {
    taskQueryRequest = {
        name: "",
        state: 0,
        timeSize: 0,
        page: 1,
        size: 40
    };
    taskQueryResponse = {} as TaskConfigPaginationResponse;

    taskEditDialogTitle = '创建任务';
    taskEditDialogVisible = false;

    async mounted() {    

        this.query();
    }

    // 查询任务配置
    async query() {
        const data = await this.$ajax.requestApi<TaskConfigPaginationRequest, TaskConfigPaginationResponse>(this.taskQueryRequest as TaskConfigPaginationRequest, {
            url: '/api/task/query'
        });
        console.log(data);
        this.taskQueryResponse = data;
    }

    // 设置状态
    async setState(id, state, actionName) {
        if(await this.$confirm(`确定要${actionName}当前任务吗？`) != 'confirm') return;

        const rsp = await this.$ajax.requestApi<any, any>({
            id,
            state
        }, {
            url: '/api/task/setState'
        });
        
        if(rsp.ret == 0) {
            this.$message.success(`${actionName}成功`);
            this.query();
        }
        else {
            this.$message.error('失败：' + rsp.msg);
        }
    }

    // 立即执行一个任务
    async runTask(id) {
        if(await this.$confirm(`如果有实例执行，会导致重复执行。确定立即执行吗？`) != 'confirm') return;

        const rsp = await this.$ajax.requestApi<any, any>({
            id
        }, {
            url: '/api/task/run'
        });
        
        if(rsp.ret == 0) {
            this.$message.success(`已进入执行队列`);
        }
        else {
            this.$message.error('失败：' + rsp.msg);
        }
    }

    // 获取执行方式文案
    getTimeTypeName(row) {
        switch(row.timeSize) {
            case TaskTimeSize.single: {
                return `${row.timeValue}执行一次`;
            }
            case TaskTimeSize.second: {
                return `每隔${row.timeValue}秒`;
            }
            case TaskTimeSize.minute: {
                return `每隔${row.timeValue}分`;
            }
            case TaskTimeSize.hour: {
                return `每隔${row.timeValue}小时`;
            }
            case TaskTimeSize.day: {
                return `每天${row.timeValue}`;
            }
            case TaskTimeSize.week: {
                return `每周${row.timeValue}`;
            }
            case TaskTimeSize.month: {
                return `每月${row.timeValue}`;
            }
        }
        return '';
    }

    // 执行方式列表
    get TaskStateOptions() {
        
        const options = [] as any;
        for(let k in TaskState) {
            const v = Number(k);
            if(isNaN(v)) continue;
            options.push({
                label: this.getTaskStateName(v),
                value: v
            });
        }
        return options;
    }

    // 获取执行方式文案
    getTaskStateName(v) {
        switch(v) {
            case TaskState.init: {
                return '初始化';
            }
            case TaskState.start: {
                return `已启用`;
            }
            case TaskState.stop: {
                return `已停用`;
            }
            case TaskState.disabled: {
                return `已失效`;
            }
        }
        return '';
    }
}