<template>      
    <div class="log-container">
        <p v-for="(item, index) in logLines" :key="index">
            {{ item }}
        </p>
    </div>
</template>
<style>
.log-container {
    background: #000;
    border: 1px solid #ccc;
    box-shadow: 0 2px 4px rgba(0, 0, 0, .12);
    padding: 4px;
    min-height: 800px;
}

.log-container > p {
    margin: 4px;
    padding: 0;
    word-wrap:break-word;
    word-break:normal; 
    color: rgb(235, 221, 221);
}
</style>
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter, } from 'vue-router';
import { ElMessageBox ,ElMessage } from 'element-plus';
import {TaskState, TaskTimeSize, TaskStatus} from '../../../base/taskConst';
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
