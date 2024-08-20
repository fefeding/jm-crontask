<template>
    <div style="width: 80%;">
        <el-form ref="form" v-model="taskData" label-width="80px">
            <el-form-item label="名称">
                <el-input v-model="taskData.name" minlength="4" maxlength="32" placeholder="请输入任务名称" show-word-limit></el-input>
            </el-form-item>
            <el-form-item label="执行方式">
                <el-col :span="4">
                    <el-select v-model="taskData.timeSize" placeholder="请选择">
                        <el-option
                        v-for="item in TimeTypeOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                        :disabled="item.value==5||item.value==6">
                        </el-option>
                    </el-select>
                </el-col>
                <el-col class="line" :span="1">
                    &nbsp;
                </el-col>
                <el-col :span="15">
                    <el-date-picker v-if="taskData.timeSize == 0"
                        v-model="taskData.timeValue"
                        value-format="yyyy-MM-dd HH:mm:ss"
                        type="datetime"
                         placeholder="选择任务执行时间">
                    </el-date-picker>
                    <el-time-picker v-else-if="taskData.timeSize == 4" placeholder="选择每天执行时间" v-model="taskData.timeValue"
                        value-format="HH:mm:ss"></el-time-picker>
                    <div v-else-if="taskData.timeSize == 7" style="display:flex">
                        <el-popover v-model="cronPopover">
                            <vue3Cron @change="changeCron" @close="cronPopover=false" :cron-value="taskData.timeValue"></vue3Cron>
                            <template #reference>
                                <el-input
                                  @focus="cronPopover=true"
                                  v-model="taskData.timeValue"
                                  placeholder="* * * * * ? *"
                                ></el-input>
                              </template>
                        </el-popover>
                        <span>(秒 分 时 日 月 周 年)</span>
                        <span style="color:red;margin-left:6px">整时整分需要将前面的秒或者分设为0</span>
                    </div>
                    <el-input-number v-else v-model="taskData.timeValue" :min="1" :max="100000" aria-label="执行隔间"></el-input-number>
                </el-col>
            </el-form-item>
            <el-form-item label="关注人">
                <el-input v-model="taskData.watcher" maxlength="64" placeholder="输入关注员工ID,用|分隔" show-word-limit></el-input>
            </el-form-item>
            <el-form-item label="脚本">
                <v-ace-editor
                v-model:value="taskScript" 
                    :readonly="false"
                    :wrap="false"
                    :print-margin="false"
                    lang="javascript"
                    theme="chrome"
                    style="height:800px; width:100%;"
                />
            </el-form-item>
            <el-form-item>
                <el-button @click="$router.go(-1)">取消</el-button>
                <el-button type="primary" @click="save()">保存</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>
<style scoped>
.el-table .unique-row {
    background: #f0f9eb;
}
.vue-codemirror {
    text-align: left;
    line-height: 22px;
    font-size: 14px;
}
.CodeMirror-wrap {
    height: 100%;
}

.jsoneditor{
    border: 1px solid #ccc;
}
</style>
<script setup lang="ts">
import { VAceEditor } from "vue3-ace-editor";
import ace from 'ace-builds';

import modeJsonUrl from 'ace-builds/src-noconflict/mode-json?url';
ace.config.setModuleUrl('ace/mode/json', modeJsonUrl);
import modeJsUrl from 'ace-builds/src-noconflict/mode-javascript?url';
ace.config.setModuleUrl('ace/mode/javascript', modeJsUrl);
import themeChromeUrl from 'ace-builds/src-noconflict/theme-chrome?url';
ace.config.setModuleUrl('ace/theme/chrome', themeChromeUrl);

import vue3Cron from 'no-vue3-cron';
import 'no-vue3-cron/lib/noVue3Cron.css'; // 引入样式

import { computed, onMounted, ref } from 'vue';
import { useRouter, type Router } from 'vue-router';
import { ElMessageBox ,ElMessage } from 'element-plus';
import {TaskState, TaskTimeSize} from '../../../base/taskConst';
import { request } from '../../../service/base';

    const props = defineProps({
        id: {
            type: Number,
            default: 0
        },
    });

    const taskData = ref({
        id: 0,
        name: '',
        description: '',
        script: '',
        timeSize: TaskTimeSize.second,
        state: TaskState.init,
        timeValue: '',
        watcher: ''
    });
    // 任务脚本
    const taskScript = ref('');
    const cronPopover = ref(false);
    const router = useRouter();
    

    // 任务执行规则值，数字和时间之间切换可能会报错。这里做下处理
    const timeValue = computed(()=>{        
        if(taskData.value.timeSize === TaskTimeSize.day || taskData.value.timeSize === TaskTimeSize.single) {
            
            if(/^\d+$/.test(taskData.value.timeValue)) {
                taskData.value.timeValue = '';
            }
            else if(taskData.value.timeSize === TaskTimeSize.single && !/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}$/.test(taskData.value.timeValue)) {
                taskData.value.timeValue = '';
            }
            else if(taskData.value.timeSize === TaskTimeSize.day && !/^\d{2}:\d{2}:\d{2}$/.test(taskData.value.timeValue)) {
                taskData.value.timeValue = '';
            }
        }
        else if(taskData.value.timeSize !== TaskTimeSize.crontab && !/^\d+$/.test(taskData.value.timeValue)) {
            taskData.value.timeValue = '1';
        }
        return taskData.value.timeValue;
    });

    onMounted(()=>{  
        const id = props.id || Number(router.currentRoute.value.query.id || 0);
        query(id);
    });

    // 查询任务配置
    async function query(id: number) {
        if(id > 0) {
            const res = await request('/api/task/query', {
                id
            });
            console.log(res);
            if(res.ret == 0 && res.data?.total) {
                Object.assign(taskData.value, res.data.data[0]);
                taskScript.value = taskData.value.script || '';
            }
        }
        else {
            taskData.value.name = '';
            taskScript.value = taskData.value.script = '';
            taskData.value.description = '';
            taskData.value.timeSize = TaskTimeSize.second,
            taskData.value.state = TaskState.init,
            taskData.value.timeValue = '';
            taskData.value.watcher = '';            
        }
    }

    async function save() {
        if(!taskData.value.timeValue) {
            ElMessage.error('请输入正确的执行时间');
            return false;
        }
        // 定时规则表达式校验
        if(taskData.value.timeSize === TaskTimeSize.crontab && (taskData.value.timeValue.split(' ').length > 7 || taskData.value.timeValue.split(' ').length < 5)) {
            ElMessage.error('请输入正确的定时规则表达式！');
            return false;
        }
        taskData.value.script = taskScript.value || '';
        const rsp = await request('/api/task/save', taskData.value);
        if(rsp.ret === 0) {
            ElMessage.success('保存成功');   
            query(rsp.data.id);         
        }
    }

    // 执行方式列表
    const TimeTypeOptions = computed(()=>{
        
        const options = [] as any;
        for(let k in TaskTimeSize) {
            const v = Number(k);
            if(isNaN(v)) continue;
            options.push({
                label: getTimeTypeName(v),
                value: v
            });
        }
        return options;
    });

    // 获取执行方式文案
    function getTimeTypeName(v: number) {
        switch(v) {
            case TaskTimeSize.single: {
                return '执行一次';
            }
            case TaskTimeSize.second: {
                return `按秒执行`;
            }
            case TaskTimeSize.minute: {
                return `按分执行`;
            }
            case TaskTimeSize.hour: {
                return `按小时执行`;
            }
            case TaskTimeSize.day: {
                return `每天`;
            }
            case TaskTimeSize.week: {
                return `每周`;
            }
            case TaskTimeSize.month: {
                return `每月`;
            }
            case TaskTimeSize.crontab: {
                return `定时规则`;
            }
        }
        return '';
    }
    // 更改定时规则
    function changeCron(val: string) {
        taskData.value.timeValue = val;
    }
</script>
