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
                                v-if="needExecCommand"
                                type="text" 
                                class="form-control"
                                v-model="taskData.execCommand"
                                :placeholder="execCommandPlaceholder"
                            >
                            <small v-if="taskData.execType == TaskExecType.js" class="text-muted text-warning">
                                内联模式在服务主进程中执行，无法强制中断脚本；建议改用子进程 JS 模式
                            </small>
                            <small v-else-if="taskData.execType == TaskExecType.node" class="text-muted">
                                子进程 JS 模式无需填写执行入口，脚本写在下方「脚本」框即可
                            </small>
                            <small v-else-if="taskData.execType == TaskExecType.shell" class="text-muted">
                                填写 Shell 命令或脚本路径（如 <code>/data/scripts/x.sh</code>）；留空则执行下方「脚本」框内容
                            </small>
                            <small v-else-if="taskData.execType == TaskExecType.python" class="text-muted">
                                填写 Python 脚本路径（如 <code>/data/scripts/x.py</code>）；留空则执行下方「脚本」框内容
                            </small>
                            <small v-else class="text-muted">
                                填写完整命令行（由系统 shell 直接执行，可混用任意命令/语言）
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
                    v-if="isScriptEditorVisible"
                    v-model:value="taskScript" 
                    :readonly="false"
                    :wrap="false"
                    :print-margin="false"
                    :lang="scriptLang"
                    theme="chrome"
                    style="height:800px; width:100%;"
                />
                <small v-if="taskData.execType == TaskExecType.command" class="text-muted">
                    外部命令模式直接在上方「执行入口」填写命令行，无需脚本内容
                </small>
                <small v-else class="text-muted">
                    语法高亮：当前为 {{ scriptLang === 'python' ? 'Python' : scriptLang === 'sh' ? 'Shell' : 'JavaScript' }}
                </small>
            </div>

            <!-- 脚本与执行器编写教程 -->
            <details class="mb-3 border rounded p-2 bg-light">
                <summary class="fw-semibold" style="cursor:pointer;">📘 脚本与执行器编写教程（点击展开）</summary>
                <div class="mt-2 small">
                    <p class="mb-1"><b>一、执行器类型怎么选</b></p>
                    <ul class="mb-2">
                        <li><b>子进程 JS（node，推荐）</b>：脚本写在下方「脚本」框，系统在独立子进程执行，崩溃隔离、超时可被看门狗真实中断。无需填写「执行入口」。</li>
                        <li><b>内联 JS（js）</b>：同样写在「脚本」框，但在服务主进程内执行，超时只能标记、无法强制杀进程，仅兼容历史任务。</li>
                        <li><b>Shell 脚本</b>：在「执行入口」填 Shell 命令或脚本路径（如 <code>/data/scripts/x.sh</code>）；也可留空，直接把脚本写在下方「脚本」框。</li>
                        <li><b>Python 脚本</b>：在「执行入口」填 <code>.py</code> 路径（如 <code>/data/scripts/x.py</code>）；也可留空，直接把 Python 代码写在下方「脚本」框。</li>
                        <li><b>外部命令</b>：在「执行入口」填完整命令行（由系统 shell 执行，可混用任意命令/语言），如 <code>curl -s https://example.com | python3 -</code>。</li>
                    </ul>

                    <p class="mb-1"><b>二、JS 脚本（node / js）可用全局</b></p>
                    <ul class="mb-2">
                        <li><code>console.log / info / warn / error</code>：输出日志（显示在「试运行」日志面板，上限 512KB）。</li>
                        <li><code>request(url, data, option)</code>：HTTP 请求助手（POST，默认超时 30s），返回 <code>res.data</code>。</li>
                        <li><code>sleep(ms)</code>：异步等待毫秒。</li>
                        <li><code>task</code>：当前任务上下文 <code>{ id, name, description, timeSize, timeValue }</code>。</li>
                        <li><code>modules.axios / modules.moment / modules.path</code>：已注入的常用库（<code>modules.axios</code> 可 <code>.create({ timeout })</code> 自定义超时）。</li>
                        <li><code>require('模块名')</code>：仅限白名单内的模块。</li>
                    </ul>

                    <p class="mb-1"><b>三、示例：调用接口并打日志（node）</b></p>
                    <pre class="bg-white border p-2 mb-2" style="white-space:pre-wrap;">const res = await request('https://api.example.com/data');
console.log('code', res.code, 'size', JSON.stringify(res).length);
if (res.code !== 0) throw res;</pre>

                    <p class="mb-1"><b>四、示例：用 axios 拉取 RSS（node）</b></p>
                    <pre class="bg-white border p-2 mb-2" style="white-space:pre-wrap;">const client = modules.axios.create({ timeout: 30000 });
const { data } = await client.get('https://api.aigcwhere.com/rss/all', { responseType: 'text' });
console.log('bytes', data.length);</pre>

                    <p class="mb-1"><b>五、Shell / Python / 命令的可用环境变量</b></p>
                    <ul class="mb-2">
                        <li><code>TASK_ID</code> / <code>TASK_NAME</code> / <code>INSTANCE_ID</code>：当前任务与实例信息。</li>
                        <li>继承服务进程的全部环境变量；可在「环境变量(JSON)」中追加自定义变量。</li>
                    </ul>

                    <p class="mb-1"><b>六、超时与中断 &amp; 注意事项</b></p>
                    <ul class="mb-0">
                        <li>「超时时间(秒)」到点后，子进程模式（node/shell/python/command）会被看门狗强制终止；内联 JS 仅标记为超时、无法强杀。</li>
                        <li>所有脚本/命令在<b>执行服务器本机</b>运行，需确保对应运行时（node / python3 / bash）已安装、脚本路径可达、且网络出网正常。</li>
                    </ul>
                </div>
            </details>

            <div class="mb-3">
                <div class="d-flex align-items-center flex-wrap mb-2">
                    <button type="button" class="btn btn-outline-primary me-2" @click="testRun()" :disabled="testing">
                        {{ testing ? '试运行中...' : '试运行' }}
                    </button>
                    <span v-if="testResult" class="badge me-2" :class="testBadgeClass">{{ testBadgeText }}</span>
                    <span v-if="testResult && testResult.duration" class="text-muted me-2">耗时 {{ testResult.duration }}ms</span>
                    <span v-if="testResult && testResult.exitCode !== undefined" class="text-muted">退出码 {{ testResult.exitCode }}</span>
                </div>

                <div v-if="testResult && testResult.message" :class="testResult.success ? 'text-success' : 'text-danger'">
                    {{ testResult.message }}
                </div>

                <div v-if="testResult && testResult.log" class="mt-2">
                    <div class="form-text mb-1">执行日志（脚本内的 console 输出与错误堆栈，用于排查问题）：</div>
                    <div class="log-box border rounded p-2 bg-light">
                        <div
                            v-for="(line, i) in testLogLines"
                            :key="i"
                            class="log-line"
                            :class="logLineClass(line)"
                        >{{ line }}</div>
                    </div>
                </div>
                <div v-else-if="testResult" class="text-muted mt-2">本次执行没有产生日志输出。</div>
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

/* 试运行机制日志面板 */
.log-box {
    max-height: 360px;
    overflow: auto;
    font-family: var(--bs-font-monospace, monospace);
}
.log-line {
    white-space: pre-wrap;
    word-break: break-all;
    font-size: 13px;
    line-height: 1.5;
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
        // 执行器入口校验（node/js 用脚本框，shell/python/command 需执行入口或脚本）
        if(!validateExecEntry()) {
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
     * 是否显示「执行入口」输入框
     * node / js 不需要；shell / python / command 需要
     */
    const needExecCommand = computed(() => {
        const t = taskData.value.execType;
        return t === TaskExecType.shell || t === TaskExecType.python || t === TaskExecType.command;
    });

    /** 是否展示脚本编辑器（command 模式无需脚本内容） */
    const isScriptEditorVisible = computed(() => {
        const t = taskData.value.execType;
        return t === TaskExecType.js || t === TaskExecType.node
            || t === TaskExecType.shell || t === TaskExecType.python;
    });

    /** 脚本编辑器语法高亮语言 */
    const scriptLang = computed(() => {
        const t = taskData.value.execType;
        if (t === TaskExecType.python) return 'python';
        if (t === TaskExecType.shell) return 'sh';
        return 'javascript';
    });

    /** 执行入口占位提示 */
    const execCommandPlaceholder = computed(() => {
        switch (taskData.value.execType) {
            case TaskExecType.shell: return 'Shell 命令或脚本路径，如 /data/scripts/x.sh';
            case TaskExecType.python: return 'Python 脚本路径，如 /data/scripts/x.py';
            case TaskExecType.command: return '完整命令行，如 curl -s https://example.com | python3 -';
            default: return '脚本路径或命令行';
        }
    });

    /**
     * 执行器入口校验：
     * - js / node：必须填写「脚本」框
     * - shell / python：脚本框 或 执行入口 至少填一项
     * - command：必须填写「执行入口」
     */
    function validateExecEntry(): boolean {
        const t = taskData.value.execType;
        const script = (taskScript.value || '').trim();
        const cmd = (taskData.value.execCommand || '').trim();
        if (t === TaskExecType.js || t === TaskExecType.node) {
            if (!script) {
                $toast?.error(t === TaskExecType.node
                    ? '子进程 JS 模式需在「脚本」框中填写 JS 代码'
                    : '内联 JS 模式需在「脚本」框中填写 JS 代码');
                return false;
            }
        } else if (t === TaskExecType.command) {
            if (!cmd) {
                $toast?.error('外部命令模式必须在「执行入口」填写命令行');
                return false;
            }
        } else if (t === TaskExecType.shell || t === TaskExecType.python) {
            if (!cmd && !script) {
                $toast?.error('Shell / Python 模式需填写「脚本」或「执行入口」至少一项');
                return false;
            }
        }
        return true;
    }

    /**
     * 试运行脚本，不保存配置
     */
    async function testRun() {
        if(!validateExecEntry()) {
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
        catch(e: any) {
            // 接口调用本身失败（网络错误 / 后端 500 等）：把错误也放进结果面板，
            // 避免用户只看到一个“试运行失败”的 toast 而看不到任何排查信息
            testResult.value = {
                success: false,
                status: 'error',
                message: (e && e.message) || '调用试运行接口失败',
                duration: 0,
                exitCode: -1,
                log: '[error] 调用试运行接口失败：' + ((e && e.message) || String(e)),
            };
            $toast?.error('试运行接口调用失败');
        }
        finally {
            testing.value = false;
        }
    }

    // 试运行日志按行拆分，便于逐行着色
    const testLogLines = computed<string[]>(() => {
        const log = testResult.value?.log || '';
        return log.split('\n');
    });

    // 日志行着色：错误红、警告黄、其余默认
    function logLineClass(line: string) {
        if (/\[error\]/i.test(line)) return 'text-danger';
        if (/\[warn\]/i.test(line)) return 'text-warning';
        return '';
    }

    // 状态徽标文案与配色
    const testBadgeText = computed<string>(() => {
        const r = testResult.value;
        if (!r) return '';
        if (r.status === 'timeout') return '超时';
        if (r.status === 'error') return '接口错误';
        return r.success ? '成功' : '失败';
    });
    const testBadgeClass = computed<string>(() => {
        const r = testResult.value;
        if (!r) return 'bg-secondary';
        if (r.status === 'timeout') return 'bg-warning text-dark';
        if (r.status === 'error') return 'bg-danger';
        return r.success ? 'bg-success' : 'bg-danger';
    });

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
