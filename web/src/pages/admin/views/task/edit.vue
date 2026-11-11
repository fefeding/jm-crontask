<template>
    <div style="width: 80%;">
        <form>
            <div class="mb-3">
                <label for="name" class="form-label">名称</label>
                <input 
                    type="text" 
                    class="form-control" 
                    id="name" 
                    v-model="taskData.name" 
                    minlength="4" 
                    maxlength="32" 
                    placeholder="请输入任务名称"
                    required
                >
                <div class="form-text">{{ taskData.name?.length || 0 }}/32 字符</div>
            </div>
            
            <div class="mb-3 row">
                <label class="col-sm-2 col-form-label">执行方式</label>
                <div class="col-sm-10">
                    <div class="row">
                        <div class="col-md-3">
                            <select v-model="taskData.timeSize" class="form-select">
                                <option 
                                    v-for="item in TimeTypeOptions"
                                    :key="item.value"
                                    :value="item.value">
                                    {{ item.label }}
                                </option>
                            </select>
                        </div>
                        <div class="col-md-9">
                            <div v-if="taskData.timeSize == 0">
                                <input 
                                    type="datetime-local" 
                                    class="form-control"
                                    v-model="datetimeValue"
                                >
                            </div>
                            <div v-else-if="taskData.timeSize == 4">
                                <input 
                                    type="time" 
                                    class="form-control"
                                    v-model="timeValue"
                                >
                            </div>
                            <div v-else-if="taskData.timeSize == 7" class="d-flex flex-column">
                                <div class="input-group mb-2">
                                    <input 
                                        type="text" 
                                        class="form-control"
                                        v-model="taskData.timeValue"
                                        placeholder="* * * * * ? *"
                                        @focus="showCronPopover=true"
                                    >
                                    <button class="btn btn-outline-secondary" type="button" @click="showCronPopover = !showCronPopover">
                                        <i class="bi bi-calendar3"></i>
                                    </button>
                                </div>
                                <small class="text-muted">(秒 分 时 日 月 周 年)</small>
                                <small class="text-danger">整时整分需要将前面的秒或者分设为0</small>
                                
                                <!-- Cron 表达式选择器 -->
                                <div v-if="showCronPopover" class="card mt-2">
                                    <div class="card-body">
                                        <vue3Cron @change="changeCron" @close="showCronPopover=false" :cron-value="taskData.timeValue"></vue3Cron>
                                    </div>
                                </div>
                            </div>
                            <div v-else-if="taskData.timeSize == 5" class="d-flex flex-column">
                                <input 
                                    type="text" 
                                    class="form-control"
                                    v-model="timeValue"
                                    placeholder="1 10:00:00"
                                >
                                <small class="text-muted">格式：星期(1-7，1为周一) + 空格 + 时间，如 "1 10:00:00"</small>
                            </div>
                            <div v-else-if="taskData.timeSize == 6" class="d-flex flex-column">
                                <input 
                                    type="text" 
                                    class="form-control"
                                    v-model="timeValue"
                                    placeholder="15 10:00:00"
                                >
                                <small class="text-muted">格式：几号(1-31) + 空格 + 时间，如 "15 10:00:00"</small>
                            </div>
                            <input 
                                v-else 
                                type="number" 
                                class="form-control"
                                v-model.number="taskData.timeValue" 
                                :min="1" 
                                :max="100000" 
                                placeholder="执行间隔"
                            >
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="mb-3 row">
                <label class="col-sm-2 col-form-label">超时时间(秒)</label>
                <div class="col-sm-10">
                    <input 
                        type="number" 
                        class="form-control"
                        v-model.number="taskData.timeout" 
                        :min="0" 
                        :max="100000" 
                        placeholder="任务执行超时时间"
                    >
                </div>
            </div>
            
            <div class="mb-3 row">
                <label class="col-sm-2 col-form-label">执行器</label>
                <div class="col-sm-10">
                    <div class="row">
                        <div class="col-md-4">
                            <select v-model="taskData.execType" class="form-select">
                                <option :value="TaskExecType.node">子进程 JS（隔离，可强制中断）</option>
                                <option :value="TaskExecType.js">内联 JS（主进程，兼容旧任务）</option>
                                <option :value="TaskExecType.shell">Shell 脚本</option>
                                <option :value="TaskExecType.python">Python 脚本</option>
                                <option :value="TaskExecType.command">外部命令</option>
                            </select>
                        </div>
                        <div class="col-md-8">
                            <input 
                                v-if="taskData.execType != TaskExecType.js"
                                type="text" 
                                class="form-control"
                                v-model="taskData.execCommand"
                                placeholder="脚本路径或命令行"
                            >
                            <small v-else class="text-muted text-warning">
                                内联模式在服务主进程中执行，无法强制中断脚本；建议改用子进程 JS 模式
                            </small>
                        </div>
                    </div>
                </div>
            </div>

            <div class="mb-3 row">
                <label class="col-sm-2 col-form-label">失败重试</label>
                <div class="col-sm-10">
                    <div class="row">
                        <div class="col-md-3">
                            <input 
                                type="number" 
                                class="form-control"
                                v-model.number="taskData.maxRetry" 
                                :min="0" 
                                :max="10" 
                                placeholder="重试次数"
                            >
                        </div>
                        <div class="col-md-3">
                            <input 
                                type="number" 
                                class="form-control"
                                v-model.number="taskData.retryInterval" 
                                :min="0" 
                                :max="100000" 
                                placeholder="重试间隔(秒)"
                            >
                        </div>
                        <div class="col-md-6">
                            <small class="text-muted">失败后自动重试的次数与间隔秒数</small>
                        </div>
                    </div>
                </div>
            </div>

            <div class="mb-3 row">
                <label class="col-sm-2 col-form-label">漏跑补偿</label>
                <div class="col-sm-10">
                    <select v-model="taskData.missPolicy" class="form-select">
                        <option :value="TaskMissPolicy.once">合并补跑一次（默认）</option>
                        <option :value="TaskMissPolicy.all">全量补跑</option>
                        <option :value="TaskMissPolicy.skip">不补跑</option>
                    </select>
                    <small class="text-muted">服务停机期间错过的执行点如何补偿</small>
                </div>
            </div>

            <div class="mb-3 row">
                <label class="col-sm-2 col-form-label">产物目录</label>
                <div class="col-sm-10">
                    <input 
                        type="text" 
                        class="form-control"
                        v-model="taskData.publishDir"
                        placeholder="任务产物目录，执行完成后会备份到历史目录"
                    >
                </div>
            </div>

            <div class="mb-3">
                <label for="watcher" class="form-label">关注人</label>
                <input 
                    type="text" 
                    class="form-control" 
                    id="watcher" 
                    v-model="taskData.watcher" 
                    maxlength="64" 
                    placeholder="输入关注员工ID,用|分隔"
                >
                <div class="form-text">{{ taskData.watcher?.length || 0 }}/64 字符</div>
            </div>
            
            <div class="mb-3">
                <label class="form-label">脚本</label>
                <VAceEditor
                    v-if="taskData.execType == TaskExecType.js || taskData.execType == TaskExecType.node"
                    v-model:value="taskScript" 
                    :readonly="false"
                    :wrap="false"
                    :print-margin="false"
                    lang="javascript"
                    theme="chrome"
                    style="height:800px; width:100%;"
                />
                <small v-else class="text-muted">当前执行器使用外部脚本/命令，无需填写脚本内容</small>
            </div>

            <div class="mb-3">
                <button type="button" class="btn btn-outline-primary me-2" @click="testRun()" :disabled="testing">
                    {{ testing ? '试运行中...' : '试运行' }}
                </button>
                <span v-if="testResult" :class="testResult.success ? 'text-success' : 'text-danger'">
                    {{ testResult.success ? '执行成功' : (testResult.message || '执行失败') }}
                    <span v-if="testResult.duration"> （耗时 {{ testResult.duration }}ms）</span>
                </span>
            </div>

            <div v-if="testResult && testResult.log" class="mb-3">
                <pre class="border rounded p-2 bg-light" style="max-height:320px; overflow:auto; white-space:pre-wrap">{{ testResult.log }}</pre>
            </div>
            
            <div class="mb-3">
                <button type="button" class="btn btn-secondary me-2" @click="$router.go(-1)">取消</button>
                <button type="button" class="btn btn-primary" @click="save()">保存</button>
            </div>
        </form>
    </div>
</template>
<style scoped>
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

/* 自定义 Bootstrap 样式调整 */
.form-label {
    font-weight: 600;
}

.card {
    z-index: 1000;
    position: relative;
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
// @ts-ignore
import vue3Cron from 'no-vue3-cron';
import 'no-vue3-cron/lib/noVue3Cron.css'; // 引入样式

import { computed, getCurrentInstance, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import {TaskState, TaskTimeSize, TaskExecType, TaskMissPolicy} from '@/base/taskConst';
import { request } from '@/service/base';
import { testScript } from '@/service/task';
import { type ToastType } from '@/components/toast/index';

const instance = getCurrentInstance();
const $toast = instance?.appContext.config?.globalProperties?.$toast as ToastType;

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
        timeout: 1800,
        watcher: '',
        execType: TaskExecType.node,
        execCommand: '',
        workDir: '',
        envJson: '',
        missPolicy: TaskMissPolicy.once,
        maxRetry: 0,
        retryInterval: 60,
        publishDir: ''
    });
    // 任务脚本
    const taskScript = ref('');
    const showCronPopover = ref(false);
    // 试运行
    const testing = ref(false);
    const testResult = ref<any>(null);
    const router = useRouter();
    

    // 任务执行规则值，数字和时间之间切换可能会报错。这里做下处理
    const timeValue = computed({        
        get() {
            const size = taskData.value.timeSize;
            if(size === TaskTimeSize.day || size === TaskTimeSize.single) {
                
                if(/^\d+$/.test(taskData.value.timeValue)) {
                    taskData.value.timeValue = '';
                }
                else if(size === TaskTimeSize.single && !/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}$/.test(taskData.value.timeValue)) {
                    taskData.value.timeValue = '';
                }
                else if(size === TaskTimeSize.day && !/^\d{1,2}:\d{1,2}(:\d{1,2})?$/.test(taskData.value.timeValue)) {
                    taskData.value.timeValue = '';
                }
            }
            else if(size === TaskTimeSize.week || size === TaskTimeSize.month) {
                // 形如 "1 10:00:00" / "15 10:00:00"，允许输入过程中的中间态
                if(taskData.value.timeValue && !/^\d{1,2}(\s+\d{1,2}(:\d{1,2}){0,2})?$/.test(taskData.value.timeValue)) {
                    taskData.value.timeValue = '';
                }
            }
            else if(size !== TaskTimeSize.crontab && !/^\d+$/.test(taskData.value.timeValue)) {
                taskData.value.timeValue = '1';
            }
            return taskData.value.timeValue;
        },
        set(value: string) {
            taskData.value.timeValue = value;
        }
    });

    // 处理日期时间格式
    const datetimeValue = computed({
        get() {
            // 将 yyyy-MM-dd HH:mm:ss 转换为 datetime-local 格式 (yyyy-MM-ddTHH:mm)
            if (taskData.value.timeValue) {
                return taskData.value.timeValue.replace(' ', 'T').substring(0, 16);
            }
            return '';
        },
        set(value: string) {
            // 将 datetime-local 格式转换回 yyyy-MM-dd HH:mm:ss
            if (value) {
                taskData.value.timeValue = value.replace('T', ' ') + ':00';
            } else {
                taskData.value.timeValue = '';
            }
        }
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
            taskData.value.execType = TaskExecType.node;
            taskData.value.execCommand = '';
            taskData.value.workDir = '';
            taskData.value.envJson = '';
            taskData.value.missPolicy = TaskMissPolicy.once;
            taskData.value.maxRetry = 0;
            taskData.value.retryInterval = 60;
            taskData.value.publishDir = '';
        }
    }

    async function save() {
        if(!taskData.value.timeValue) {
            $toast?.error('请输入正确的执行时间');
            return false;
        }
        // 定时规则表达式校验
        if(taskData.value.timeSize === TaskTimeSize.crontab && (taskData.value.timeValue.split(' ').length > 7 || taskData.value.timeValue.split(' ').length < 5)) {
            $toast?.error('请输入正确的定时规则表达式！');
            return false;
        }
        // 每周执行校验
        if(taskData.value.timeSize === TaskTimeSize.week && !/^[1-7]\s+\d{1,2}:\d{1,2}(:\d{1,2})?$/.test(taskData.value.timeValue)) {
            $toast?.error('每周执行格式应为 "星期 HH:mm:ss"，如 "1 10:00:00"');
            return false;
        }
        // 每月执行校验
        if(taskData.value.timeSize === TaskTimeSize.month && !/^([1-9]|[12]\d|3[01])\s+\d{1,2}:\d{1,2}(:\d{1,2})?$/.test(taskData.value.timeValue)) {
            $toast?.error('每月执行格式应为 "几号 HH:mm:ss"，如 "15 10:00:00"');
            return false;
        }
        // 外部执行器必须填写入口
        if(taskData.value.execType != TaskExecType.js && !taskData.value.execCommand) {
            $toast?.error('使用外部执行器时必须填写执行入口');
            return false;
        }
        taskData.value.script = taskScript.value || '';
        const rsp = await request('/api/task/save', taskData.value);
        if(rsp.ret === 0) {
            $toast?.success('保存成功');   
            query(rsp.data.id);         
        }
    }

    /**
     * 试运行脚本，不保存配置
     */
    async function testRun() {
        if(taskData.value.execType != TaskExecType.js && !taskData.value.execCommand) {
            $toast?.error('使用外部执行器时必须填写执行入口');
            return false;
        }
        testing.value = true;
        testResult.value = null;
        try {
            testResult.value = await testScript({
                script: taskScript.value || '',
                timeout: taskData.value.timeout || 30,
                execType: taskData.value.execType,
                execCommand: taskData.value.execCommand,
                workDir: taskData.value.workDir,
                envJson: taskData.value.envJson,
            });
        }
        catch(e) {
            $toast?.error('试运行失败');
        }
        finally {
            testing.value = false;
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
