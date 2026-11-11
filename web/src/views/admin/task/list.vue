<template>
  <div class="main-content">
    <div class="row mb-3">
      <div class="col">
        <form class="row g-3" @submit.prevent="() => {taskQueryRequest.page=1; query()}">
          <div class="col-auto">
            <label for="name" class="form-label">名称</label>
            <input 
              type="text" 
              class="form-control" 
              id="name" 
              v-model="taskQueryRequest.name" 
              placeholder="关键字"
            >
          </div>
          <div class="col-auto">
            <label for="state" class="form-label">状态</label>
            <select 
              class="form-select" 
              id="state" 
              v-model="taskQueryRequest.state"
              style="width: 200px;"
            >
              <option value="0">所有</option>
              <option value="1">已启用</option>
              <option value="2">已停用</option>
              <option value="3">已失效</option>
            </select>
          </div>
          <div class="col-auto d-flex align-items-end">
            <button type="submit" class="btn btn-primary me-2">查询</button>
            <button type="button" class="btn btn-success" @click="router.push({name: 'task_edit'})">创建任务</button>
          </div>
        </form>
      </div>
    </div>

    <DataGrid
      :data="taskQueryResponse.data"
      :columns="tableColumns"
      :currentPage="taskQueryRequest.page"
      :totalPages="getTotalPages()"
      :isLoading="loading"
      @pageChanged="pageChanged"
    >
    <template #updater="props">
      <StaffUserName :id="props.row.updater" domain="" style="max-height: 30px;"></StaffUserName>
    </template>
    <template #consecutiveFailures="props">
      <span v-if="props.row.consecutiveFailures > 0" class="badge bg-danger">
        {{ props.row.consecutiveFailures }} 次
      </span>
      <span v-else class="text-muted">0</span>
    </template>
    <template #missCount="props">
      <span v-if="props.row.missCount > 0" class="badge bg-warning text-dark">
        {{ props.row.missCount }} 次
      </span>
      <span v-else class="text-muted">0</span>
    </template>
      <template #actions="props">
        <div class="btn-group btn-group-sm" role="group">
          <button 
            v-if="props.row.state == 0 || props.row.state == 2 || props.row.state == 3" 
            type="button" 
            class="btn btn-success"
            @click="setState(props.row.id, 1, '启用')"
          >
            启用
          </button>
          <button 
            v-if="props.row.state == 1" 
            type="button" 
            class="btn btn-warning"
            @click="setState(props.row.id, 2, '停用')"
          >
            停用
          </button>
          <button 
            v-if="props.row.state == 1" 
            type="button" 
            class="btn btn-secondary"
            @click="runTask(props.row.id)"
          >
            立即执行
          </button>
          <router-link :to="{name:'task_edit', query: {id: props.row.id}}" class="btn btn-primary">
            修改
          </router-link>
          <button 
            v-if="props.row.state != 3" 
            type="button" 
            class="btn btn-danger"
            @click="setState(props.row.id, 3, '移除')"
          >
            移除
          </button>
          <button 
            type="button" 
            class="btn btn-info"
            @click="router.push({name: 'task_instance', query: {taskId: props.row.id}})"
          >
            查看执行情况
          </button>
        </div>
      </template>
    </DataGrid>
  </div>
</template>
<style>
</style>
<script setup lang="ts">
import { computed, getCurrentInstance, onMounted, ref, reactive } from 'vue';
import { useRouter, } from 'vue-router';
import {TaskState, TaskTimeSize, TaskExecType} from '../../../base/taskConst';
import { request } from '../../../service/base';
import StaffUserName from './staffUserName.vue';
import { type ToastType } from '@/components/toast/index';

const instance = getCurrentInstance();
const $toast = instance?.appContext.config?.globalProperties?.$toast as ToastType;

// 表格列定义
const tableColumns = computed(() => [
  { name: 'id', text: 'ID' },
  { name: 'name', text: '名称' },
  { name: 'timeSize', text: '执行方式', formatter: (row: any) => getTimeTypeName(row) },
  { name: 'execType', text: '执行器', formatter: (row: any) => getExecTypeName(row.execType) },
  { name: 'timeout', text: '超时设置(秒)' },
  { 
    name: 'updater', 
    text: '最近修改人',
  },
  { name: 'lastRunTime', text: '最近执行时间', formatter: (row: any) => row.lastRunTime || '从未执行' },
  { name: 'consecutiveFailures', text: '连续失败', formatter: (row: any) => row.consecutiveFailures || 0 },
  { name: 'missCount', text: '上次漏跑', formatter: (row: any) => row.missCount || 0 },
  { name: 'state', text: '状态', formatter: (row: any) => getTaskStateName(row.state) },
  { name: 'actions', text: '操作' }
]);

    const router = useRouter();

    const taskQueryRequest = ref({
        name: "",
        state: 0,
        timeSize: 0,
        page: 1,
        size: 40
    });
    const taskQueryResponse = ref({} as any);
    const loading = ref(false);
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
        loading.value = true;
        try {
            const res = await request('/api/task/query', taskQueryRequest.value);
            console.log(res);
            if(res.ret === 0) taskQueryResponse.value = res.data;
        } finally {
            loading.value = false;
        }
    }

    // 设置状态
    async function setState(id: number, state: number, actionName: string) {
        
        const confirmed = confirm(`确定要${actionName}当前任务吗？`);

        if (!confirmed) return;

        loading.value = true;
        try {
            const rsp = await request('/api/task/setState', {
                id,
                state
            });
            
            if(rsp.ret == 0) {
                $toast?.success(`${actionName}成功`);
                query();
            }
            else {
                $toast?.error('失败：' + rsp.msg);
            }
        } finally {
            loading.value = false;
        }
    }

    // 立即执行一个任务
    async function runTask(id: number) {
        const confirmed = confirm(`如果有实例执行，会导致重复执行。确定立即执行吗？`);            
        if (!confirmed) return;

        loading.value = true;
        try {
            const rsp = await request('/api/task/run', {
                id
            });
            
            if(rsp.ret == 0) {
                $toast?.success(`已进入执行队列`);
            }
            else {
                $toast?.error('失败：' + rsp.msg);
            }
        } finally {
            loading.value = false;
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

    // 获取执行器文案
    function getExecTypeName(v: number): string {
        switch(v) {
            case TaskExecType.js: return '内联 JS';
            case TaskExecType.node: return '子进程 JS';
            case TaskExecType.shell: return 'Shell';
            case TaskExecType.python: return 'Python';
            case TaskExecType.command: return '外部命令';
        }
        return '未知';
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

    // 分页相关函数
    function pageChanged(page: number) {
        taskQueryRequest.value.page = page;
        query();
    }

    function getTotalPages(): number {
        return Math.ceil((taskQueryResponse.value.total || 0) / taskQueryRequest.value.size);
    }
</script>
