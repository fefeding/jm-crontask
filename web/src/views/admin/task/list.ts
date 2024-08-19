import { computed, onMounted, ref } from 'vue';
import { ElMessageBox ,ElMessage } from 'element-plus';
import {TaskState, TaskTimeSize} from '../../../base/taskConst';
import { request } from '../../../service/base';
import StaffUserName from './staffUserName.vue'

//import editTask from './edit';

    const taskQueryRequest = ref({
        name: "",
        state: 0,
        timeSize: 0,
        page: 1,
        size: 40
    });
    const taskQueryResponse = ref({} as any);

    const taskEditDialogTitle = ref('创建任务');
    const taskEditDialogVisible = ref(false);
    // 执行方式列表
    const TaskStateOptions = computed(()=>{
        
        const options = [] as any;
        for(let k in TaskState) {
            const v = Number(k);
            if(isNaN(v)) continue;
            options.push({
                label: getTaskStateName(v),
                value: v
            });
        }
        return options;
    });

    onMounted(()=>{    
        query();
    });

    // 查询任务配置
    async function query() {
        const data = await request('/api/task/query', taskQueryRequest.value);
        taskQueryResponse.value = data;
    }

    // 设置状态
    async function setState(id: number, state: number, actionName: string) {
        if(await ElMessageBox.confirm(`确定要${actionName}当前任务吗？`) != 'confirm') return;

        const rsp = await request('/api/task/setState', {
            id,
            state
        });
        
        if(rsp.ret == 0) {
            ElMessage.success(`${actionName}成功`);
            query();
        }
        else {
            ElMessage.error('失败：' + rsp.msg);
        }
    }

    // 立即执行一个任务
    async function runTask(id: number) {
        if(await ElMessageBox.confirm(`如果有实例执行，会导致重复执行。确定立即执行吗？`) != 'confirm') return;

        const rsp = await request('/api/task/run', {
            id
        });
        
        if(rsp.ret == 0) {
            ElMessage.success(`已进入执行队列`);
        }
        else {
            ElMessage.error('失败：' + rsp.msg);
        }
    }

    // 获取执行方式文案
    function getTimeTypeName(row: any) {
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
            case TaskTimeSize.crontab: {
                return `定时规则：${row.timeValue}`;
            }
        }
        return '';
    }    

    // 获取执行方式文案
    function getTaskStateName(v: TaskState) {
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