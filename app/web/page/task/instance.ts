import { action } from 'commander';
import { Vue, Component, Emit } from 'vue-property-decorator';
import { TaskConfigPaginationRequest, TaskConfigPaginationResponse, TaskConfigSaveRequest, TaskConfigSaveResponse} from '../../../model/task';
import {TaskState, TaskStatus, TaskTimeSize} from '../../../model/taskConst';


import editTask from './edit';

@Component({
    components: {
        editTask,
    }
})
export default class TaskInstanceView extends Vue {
    taskQueryRequest = {
        taskId: "",
        status: 0,
        timeSize: 0,
        page: 1,
        size: 15
    };
    instanceData = {
        data: [],
        total: 0
    } as any;

    async mounted() {    
        this.taskQueryRequest.taskId = this.$route.query.taskId as string || '';
        this.query();
    }

    // 查询任务配置
    async query() {
        const data = await this.$ajax.requestApi<any, any>(this.taskQueryRequest, {
            url: '/api/instance/query'
        });
        console.log(data);
        if(data.ret == 0) {
            this.instanceData = data;
        }
        else {
            this.$message.error(data.msg);
        }
    }

    // 废弃实例
    async setFailed(id) {
        if(await this.$confirm(`确定要废弃当前实例吗？，已经在运行时不会起作用，这里主要用于清理异常数据。`) != 'confirm') return;

        const data = await this.$ajax.requestApi<any, any>({
            url: '/api/instance/updateStatus',
            data: {
                id: id,
                status: TaskStatus.failed
            }
        });
        console.log(data);
        if(data.ret == 0) {
            this.$message.success('操作成功');
            this.query();
        }
        else {
            this.$message.error('操作失败');
        }
    }

    // 获取执行方式文案
    getTaskStatusName(v) {
        switch(v) {
            case TaskStatus.init: {
                return '等待执行';
            }
            case TaskStatus.running: {
                return `执行中`;
            }
            case TaskStatus.success: {
                return `成功`;
            }
            case TaskStatus.failed: {
                return `失败`;
            }
        }
        return '';
    }
}