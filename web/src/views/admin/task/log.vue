<template>      
    <div>
        <div v-if="instance.id" class="row g-2 mb-3">
            <div class="col-auto"><small class="text-muted">实例ID：</small>{{ instance.id }}</div>
            <div class="col-auto"><small class="text-muted">状态：</small>{{ getStatusName(instance.status) }}</div>
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
import { onMounted, ref } from 'vue';
import { useRouter, } from 'vue-router';
import {TaskStatus} from '../../../base/taskConst';
import { request } from '../../../service/base';
import type { TaskInstance } from '@/domain/task';
    const router = useRouter();
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

    onMounted(async () => {  
        query();
    });

    // 查询运行详情
    async function query() {
        
        const id = Number(router.currentRoute.value.query?.id || 0);
        if(id > 0) {
            const res = await request('/api/instance/get', {
                id: id
            });
            if(res.ret == 0 && res.data) {
                
                 Object.assign(instance.value, res.data);                
                logLines.value = res.data.log?.split('\n') || [];
            }
        }
    }

    // 状态文案
    function getStatusName(status: number): string {
        switch(status) {
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
