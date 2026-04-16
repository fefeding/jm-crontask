<template>
  <div>

    <div class="row mb-3">
      <div class="col">
        <form class="row g-3" @submit.prevent="() => {taskQueryRequest.page=1; query()}">
          <div class="col-auto">
            <label for="taskId" class="form-label">任务ID</label>
            <input 
              type="text" 
              class="form-control" 
              id="taskId" 
              v-model="taskQueryRequest.taskId" 
              placeholder="任务ID"
            >
          </div>
          <div class="col-auto">
            <label for="status" class="form-label">状态</label>
            <select 
              class="form-select" 
              id="status" 
              v-model="taskQueryRequest.status"
              style="width: 200px;"
            >
              <option value="0">所有</option>
              <option value="1">运行中</option>
              <option value="2">成功</option>
              <option value="3">失败</option>
              <option value="4">超时</option>
            </select>
          </div>
          <div class="col-auto d-flex align-items-end">
            <button type="submit" class="btn btn-primary">查询</button>
          </div>
        </form>
      </div>
    </div>

    <DataGrid
      :data="instanceData.data"
      :columns="tableColumns"
      :currentPage="taskQueryRequest.page"
      :totalPages="getTotalPages()"
      :isLoading="loading"
      @pageChanged="pageChanged"
    >
      <template #status="props">
        <span class="badge" :class="getStatusBadgeClass(props.row.status)">
          {{ getTaskStatusName(props.row.status) }}
        </span>
      </template>
      <template #updater="props">
        <StaffUserName :id="props.row.updater" domain="" style="max-height: 30px;"></StaffUserName>
      </template>
      <template #actions="props">
        <div class="btn-group btn-group-sm" role="group">
          <button 
            type="button" 
            class="btn btn-info"
            @click="router.push({name: 'task_log', query: {id: props.row.id}})"
          >
            查看日志
          </button>
          <button 
            v-if="props.row.status == 1" 
            type="button" 
            class="btn btn-danger"
            @click="setFailed(props.row.id)"
          >
            作废
          </button>
        </div>
      </template>
    </DataGrid>
  </div>
</template>
<style>
</style>
<script setup lang="ts">
import { computed, getCurrentInstance, onMounted, ref } from 'vue';
import { useRouter, } from 'vue-router';
import {TaskStatus} from '../../../base/taskConst';
import { request } from '../../../service/base';
import StaffUserName from './staffUserName.vue';
import { type ToastType } from '@/components/toast/index';
import Modal from '@/components/modal/index.vue';

const instance = getCurrentInstance();
const $toast = instance?.appContext.config?.globalProperties?.$toast as ToastType;

// 表格列定义
const tableColumns = computed(() => [
  { name: 'taskName', text: '名称' },
  { name: 'taskId', text: '任务ID' },
  { name: 'status', text: '状态' },
  { name: 'execServer', text: '服务器' },
  { name: 'execStartTime', text: '执行起始时间' },
  { name: 'execEndTime', text: '执行结束时间' },
  { name: 'updater', text: '最近修改人' },
  { name: 'actions', text: '操作' }
]);
  const router = useRouter();
  const taskQueryRequest = ref({
        taskId: "",
        status: 0,
        timeSize: 0,
        page: 1,
        size: 15
    });
  const instanceData = ref({
        data: [],
        total: 0
    } as any);
  const loading = ref(false);

    onMounted(async () => {    
        taskQueryRequest.value.taskId = router.currentRoute.value.query.taskId as string || '';
        query();
    });

    // 查询任务配置
    async function query() {
        loading.value = true;
        try {
            const data = await request('/api/instance/query', taskQueryRequest.value,);
            console.log(data);
            if(data.ret == 0) {
                instanceData.value = data;
            }
            else {
              $toast?.error(data.msg);
            }
        } finally {
            loading.value = false;
        }
    }

    // 废弃实例
    async function setFailed(id: number) {
        const confirmed = confirm('确定要废弃当前实例吗？，已经在运行时不会起作用，这里主要用于清理异常数据。');

        if (!confirmed) return;

        loading.value = true;
        try {
            const data = await request('/api/instance/updateStatus', {
                    id: id,
                    status: TaskStatus.failed
            });
            console.log(data);
            if(data.ret == 0) {
              $toast?.success('操作成功');
              query();
            }
            else {
              $toast?.error('操作失败');
            }
        } finally {
            loading.value = false;
        }
    }

    // 获取状态徽章样式
    function getStatusBadgeClass(status: number): string {
        switch(status) {
            case TaskStatus.init: {
                return 'bg-secondary';
            }
            case TaskStatus.running: {
                return 'bg-primary';
            }
            case TaskStatus.success: {
                return 'bg-success';
            }
            case TaskStatus.failed: {
                return 'bg-danger';
            }
            case TaskStatus.timeout: {
                return 'bg-warning';
            }
        }
        return 'bg-secondary';
    }

    // 获取执行方式文案
    function getTaskStatusName(v: number) {
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
            case TaskStatus.timeout: {
                return `超时`;
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
        return Math.ceil((instanceData.value.total || 0) / taskQueryRequest.value.size);
    }
</script>
