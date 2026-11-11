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
          <button 
            type="button" 
            class="btn btn-warning"
            @click="diagnose(props.row.id)"
          >
            诊断
          </button>
        </div>
      </template>
    </DataGrid>

    <Modal
      :visible="diagnoseVisible"
      title="任务健康度诊断"
      :confirmButton="{ show: false }"
      :closeButton="{ show: true, text: '关闭' }"
      :isLoading="diagnosing"
      @hidden="diagnoseVisible = false"
    >
      <div v-if="diagnoseResult">
        <div class="d-flex align-items-center mb-3">
          <span class="badge fs-6 me-2" :class="healthClass(diagnoseResult.health)">
            {{ healthText(diagnoseResult.health) }}
          </span>
          <strong class="me-2">健康分 {{ diagnoseResult.score }}</strong>
          <span class="text-muted">{{ diagnoseResult.summary }}</span>
        </div>

        <div class="row g-2 mb-3">
          <div class="col-6 col-md-3">
            <div class="border rounded p-2 text-center">
              <div class="text-muted small">采样实例</div>
              <div>{{ diagnoseResult.stats.total }}</div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="border rounded p-2 text-center">
              <div class="text-muted small">成功率</div>
              <div>{{ diagnoseResult.stats.successRate }}%</div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="border rounded p-2 text-center">
              <div class="text-muted small">平均耗时</div>
              <div>{{ formatDuration(diagnoseResult.stats.avgDuration) }}</div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="border rounded p-2 text-center">
              <div class="text-muted small">P95 耗时</div>
              <div>{{ formatDuration(diagnoseResult.stats.p95Duration) }}</div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="border rounded p-2 text-center">
              <div class="text-muted small">超时占比</div>
              <div>{{ diagnoseResult.stats.timeoutRate }}%</div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="border rounded p-2 text-center">
              <div class="text-muted small">连续失败</div>
              <div>{{ diagnoseResult.stats.consecutiveFailures }}</div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="border rounded p-2 text-center">
              <div class="text-muted small">上次漏跑</div>
              <div>{{ diagnoseResult.stats.missCount }}</div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="border rounded p-2 text-center">
              <div class="text-muted small">累计重试</div>
              <div>{{ diagnoseResult.stats.retryTotal }}</div>
            </div>
          </div>
        </div>

        <h6>问题清单</h6>
        <div v-if="!diagnoseResult.issues.length" class="text-success mb-3">
          未发现明显问题，任务配置与运行状况良好。
        </div>
        <div
          v-for="(issue, index) in diagnoseResult.issues"
          :key="index"
          class="border rounded p-2 mb-2"
        >
          <div class="d-flex align-items-center">
            <span class="badge me-2" :class="issueLevelClass(issue.level)">
              {{ issueLevelText(issue.level) }}
            </span>
            <strong>{{ issue.title }}</strong>
          </div>
          <div class="small mt-1">{{ issue.detail }}</div>
          <div class="small mt-1 text-primary">建议：{{ issue.suggestion }}</div>
        </div>

        <h6 class="mt-3">最近执行</h6>
        <div class="table-responsive">
          <table class="table table-sm mb-0">
            <thead>
              <tr>
                <th>执行时间</th>
                <th>状态</th>
                <th>耗时</th>
                <th>退出码</th>
                <th>重试</th>
                <th>触发</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in diagnoseResult.timeline" :key="item.id">
                <td>{{ item.execStartTime || '-' }}</td>
                <td>{{ item.statusText }}</td>
                <td>{{ formatDuration(item.duration) }}</td>
                <td>{{ item.exitCode }}</td>
                <td>{{ item.retryCount }}</td>
                <td>{{ item.triggerType == 1 ? '手动' : '定时' }}</td>
              </tr>
              <tr v-if="!diagnoseResult.timeline.length">
                <td colspan="6" class="text-center text-muted">暂无执行记录</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  </div>
</template>
<style>
</style>
<script setup lang="ts">
import { computed, getCurrentInstance, onMounted, ref, reactive } from 'vue';
import { useRouter, } from 'vue-router';
import {TaskState, TaskTimeSize, TaskExecType} from '@/base/taskConst';
import { request } from '@/service/base';
import { diagnoseTask } from '@/service/task';
import type { DiagnoseResult, DiagnoseHealth, DiagnoseIssueLevel } from '@/domain/task';
import Modal from '@/components/modal/index.vue';
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
    // 诊断相关状态
    const diagnoseVisible = ref(false);
    const diagnosing = ref(false);
    const diagnoseResult = ref<DiagnoseResult | null>(null);
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

    /**
     * 诊断任务健康状况
     */
    async function diagnose(id: number) {
        diagnoseVisible.value = true;
        diagnosing.value = true;
        diagnoseResult.value = null;
        try {
            const res = await diagnoseTask(id);
            if(res.ret == 0 && res.data) {
                diagnoseResult.value = res.data;
            }
            else {
                $toast?.error(res.msg || '诊断失败');
                diagnoseVisible.value = false;
            }
        }
        catch(e) {
            $toast?.error('诊断失败');
            diagnoseVisible.value = false;
        }
        finally {
            diagnosing.value = false;
        }
    }

    // 健康状态徽章样式
    function healthClass(health: DiagnoseHealth): string {
        switch(health) {
            case 'healthy': return 'bg-success';
            case 'warning': return 'bg-warning text-dark';
            default: return 'bg-danger';
        }
    }

    // 健康状态文案
    function healthText(health: DiagnoseHealth): string {
        switch(health) {
            case 'healthy': return '健康';
            case 'warning': return '需关注';
            default: return '异常';
        }
    }

    // 问题级别徽章样式
    function issueLevelClass(level: DiagnoseIssueLevel): string {
        switch(level) {
            case 'error': return 'bg-danger';
            case 'warn': return 'bg-warning text-dark';
            default: return 'bg-info text-dark';
        }
    }

    // 问题级别文案
    function issueLevelText(level: DiagnoseIssueLevel): string {
        switch(level) {
            case 'error': return '严重';
            case 'warn': return '警告';
            default: return '提示';
        }
    }

    // 毫秒耗时格式化
    function formatDuration(ms: number): string {
        if(!ms) return '-';
        if(ms < 1000) return ms + 'ms';
        if(ms < 60000) return (ms / 1000).toFixed(2) + 's';
        return Math.floor(ms / 60000) + '分' + Math.round((ms % 60000) / 1000) + '秒';
    }

    // 获取执行器文案
    function getExecTypeName(v: number): string {        switch(v) {
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
