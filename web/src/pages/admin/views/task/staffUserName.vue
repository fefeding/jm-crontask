<template>
    <span class="jv-user-name">
        {{userName}}
    </span>
</template>
<script setup lang="ts">
import { queryUserName } from '@/service/account';
import { onMounted, ref } from 'vue';
    const props = defineProps({
        id: {
            // updater 字段在库中是字符串（账号名或历史 id），不能只声明 Number
            type: [Number, String],
            default: 0
        },
    });

    const userName = ref('');

    onMounted(async ()=>{
        if(props.id) {
            const res = await queryUserName({
                loginId: props.id
            });
            if(res.ret === 0) {
                if(Array.isArray(res.data) && res.data.length) userName.value = res.data[0].name || '';
                else userName.value = res.data.name || '';
            }
        }
    });
</script>