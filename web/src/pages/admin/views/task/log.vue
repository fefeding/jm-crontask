<template>      
    <div>
        <!-- 检索表单：未选中具体实例时展示 -->
        <div v-if="!selectedId" class="row mb-3">
            <div class="col">
                <form class="row g-3" @submit.prevent="() => { listQuery.page = 1; queryList() }">
                    <div class="col-auto">
                        <label for="taskId" class="form-label">任务ID</label>
                        <input
                            type="text"
                            class="form-control"
                            id="taskId"
                            v-model="listQuery.taskId"
                            placeholder="任务ID"
                        >
                    </div>
                    <div class="col-auto">
                        <label for="status" class="form-label">状态</label>
                        <select
                            class="form-select"
                            id="status"
                            v-model="listQuery.status"
                            style="width: 200px;"
                        >
                            <option value="0">所有</option>
                            <option value="1">运行中</option>
                            <option value="2">成功</option>
                            <option value="3">失败</option>
                            <option value="4">超时</option>
                            <option value="5">已终止</option>
                        </select>
                    </div>
                    <div class="col-auto d-flex align-items-end">
                        <button type="submit" class="btn btn-primary">查询</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- 实例列表 -->
        <DataGrid
            v-if="!selectedId"
            :data="instanceData.data"
            :columns="listColumns"
            :currentPage="listQuery.page"
            :totalPages="getTotalPages()"
            :isLoading="listLoading"
            @pageChanged="pageChanged"
            @rowClicked="openLog"
        >
            <template #status="props">
                <span class="badge" :class="getStatusBadgeClass(props.row.status)">
                    {{ getTaskStatusName(props.row.status) }}
                </span>
            </template>
            <template #duration="props">
                {{ props.row.duration ? (props.row.duration / 1000).toFixed(2) + 's' : '-' }}
            </template>
            <template #triggerType="props">
                {{ props.row.triggerType == 1 ? '手动' : '定时' }}
            </template>
            <template #actions="props">
                <button
                    type="button"
                    class="btn btn-sm btn-info"
                    @click.stop="openLog(props.row)"
                >
                    查看日志
                </button>
            </template>
        </DataGrid>

        <!-- 日志详情 -->
        <div v-else>
            <div class="mb-2">
                <button type="button" class="btn btn-sm btn-outline-secondary" @click="backToList">
                    返回列表
                </button>
            </div>
            <div v-if="instance.id" class="row g-2 mb-3">
                <div class="col-auto"><small class="text-muted">实例ID：</small>{{ instance.id }}</div>
                <div class="col-auto"><small class="text-muted">状态：</small>{{ getTaskStatusName(instance.status) }}</div>
                <div class="col-auto"><small class="text-muted">耗时：</small>{{ instance.duration ? (instance.duration/1000).toFixed(2)+'s' : '-' }}</div>
                <div class="col-auto"><small class="text-muted">退出码：</small>{{ instance.exitCode }}</div>
                <div class="col-auto"><small class="text-muted">重试次数：</small>{{ instance.retryCount || 0 }}</div>
                <div class="col-auto"><small class="text-muted">触发方式：</small>{{ instance.triggerType == 1 ? '手动' : '定时' }}</div>
                <div class="col-auto"><small class="text-muted">执行服务器：</small>{{ instance.execServer || '-' }}</div>
                <div class="col-auto"><small class="text-muted">日志文件：</small>{{ instance.logPath || '-' }}</div>
                <div class="col-auto"><small class="text-muted">产物备份：</small>{{ instance.publishPath || '-' }}</div>
            </div>
            <div class="log-container">
                <p v-for="(item, index) in logLines" :key="index">
                    {{ item }}
                </p>
                <p v-if="!logLines.length" class="text-muted">暂无日志内容</p>
            </div>
        </div>
    </div>
</template>
<style scoped>
.log-container {
    background: #000;
    border: 1px solid #dee2e6;
    border-radius: 0.375rem;
    padding: 1rem;
    min-height: 800px;
    font-family: 'Courier New', monospace;
    font-size: 0.875rem;
    overflow-y: auto;
    white-space: pre-wrap;
}

.log-container > p {
    margin: 0.25rem 0;
    padding: 0;
    word-wrap: break-word;
    word-break: normal; 
    color: #ebe7e7;
    line-height: 1.4;
}

/* 添加一些日志级别的颜色 */
.log-error {
    color: #ff6b6b;
}

.log-warning {
    color: #ffd93d;
}

.log-info {
    color: #74c0fc;
}

.log-success {
    color: #51cf66;
}
</style>
<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter, } from 'vue-router';
import {TaskStatus} from '@/base/taskConst';
import { request } from '@/service/base';
import type { TaskInstance } from '@/domain/task';

const router = useRouter();

// 当前选中的实例ID（来自 URL ?id= 或列表点选）
const selectedId = ref(Number(router.currentRoute.value.query?.id || 0));

// 日志详情
const instance = ref({
    id: 0,
    log: '',
    execStartTime: '',
    execEndTime: '',
    execServer: '',
    duration: 0,
    exitCode: 0,
    retryCount: 0,
    triggerType: 0,
    logPath: '',
    publishPath: '',
    status: TaskStatus.init
} as any as TaskInstance);

const logLines = ref([] as Array<string>);

// 实例列表
const listQuery = ref({
    taskId: '',
    status: 0,
    timeSize: 0,
    page: 1,
    size: 15
});
const instanceData = ref({
    data: [],
    total: 0
} as any);
const listLoading = ref(false);

const listColumns = computed(() => [
    { name: 'taskName', text: '名称' },
    { name: 'taskId', text: '任务ID' },
    { name: 'status', text: '状态' },
    { name: 'execServer', text: '服务器' },
    { name: 'execStartTime', text: '执行起始时间' },
    { name: 'execEndTime', text: '执行结束时间' },
    { name: 'duration', text: '耗时' },
    { name: 'exitCode', text: '退出码' },
    { name: 'triggerType', text: '触发方式' },
    { name: 'actions', text: '操作' }
]);

onMounted(async () => {
    if (selectedId.value > 0) {
        fetchDetail();
    } else {
        queryList();
    }
});

// URL ?id= 变化时同步（如从实例列表页跳转过来）
watch(
    () => router.currentRoute.value.query?.id,
    (id) => {
        const newId = Number(id || 0);
        if (newId !== selectedId.value) {
            selectedId.value = newId;
            if (newId > 0) {
                fetchDetail();
            } else {
                queryList();
            }
        }
    }
);

// 查询运行详情
async function fetchDetail() {
    const res = await request('/api/instance/get', {
        id: selectedId.value
    });
    if (res.ret == 0 && res.data) {
        Object.assign(instance.value, res.data);
        logLines.value = res.data.log?.split('\n') || [];
    } else {
        logLines.value = [];
    }
}

// 点选某条实例查看日志
function openLog(row: any) {
    selectedId.value = Number(row.id) || 0;
    router.replace({ query: { ...router.currentRoute.value.query, id: String(selectedId.value) } });
    fetchDetail();
}

// 返回实例列表
function backToList() {
    selectedId.value = 0;
    const query = { ...router.currentRoute.value.query };
    delete query.id;
    router.replace({ query });
    queryList();
}

// 查询实例列表
async function queryList() {
    listLoading.value = true;
    try {
        const data = await request('/api/instance/query', listQuery.value);
        if (data.ret == 0) {
            instanceData.value = data;
        }
    } finally {
        listLoading.value = false;
    }
}

function pageChanged(page: number) {
    listQuery.value.page = page;
    queryList();
}

function getTotalPages(): number {
    return Math.ceil((instanceData.value.total || 0) / listQuery.value.size);
}

// 状态徽章样式
function getStatusBadgeClass(status: number): string {
    switch (status) {
        case TaskStatus.init: return 'bg-secondary';
        case TaskStatus.running: return 'bg-primary';
        case TaskStatus.success: return 'bg-success';
        case TaskStatus.failed: return 'bg-danger';
        case TaskStatus.timeout: return 'bg-warning';
        case TaskStatus.canceled: return 'bg-dark';
    }
    return 'bg-secondary';
}

// 状态文案
function getTaskStatusName(v: number): string {
    switch (v) {
        case TaskStatus.init: return '等待执行';
        case TaskStatus.running: return '执行中';
        case TaskStatus.success: return '成功';
        case TaskStatus.failed: return '失败';
        case TaskStatus.timeout: return '超时';
        case TaskStatus.canceled: return '已终止';
    }
    return '';
}
</script>
