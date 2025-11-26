<template>      
    <div class="log-container">
        <p v-for="(item, index) in logLines" :key="index">
            {{ item }}
        </p>
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
    const router = useRouter();
    const instance = ref({
        log: '',
        execStartTime: '',
        execEndTime: '',
        status: TaskStatus.init
    } as any);

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
            console.log(res);
            if(res.ret == 0 && res.data) {
                
                 Object.assign(instance.value, res.data);                
                logLines.value = res.data.log?.split('\n');
            }
        }
    }
</script>
