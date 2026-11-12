<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getSystemInfo } from '@/service/dashboard';

/** 运行时系统信息 */
const systemInfo = ref({
    version: '2.0.0',
    uptime: '0天 0小时',
    nodeVersion: '',
    memoryUsage: '0MB',
    platform: ''
});

/** 特征能力卡片 */
const features = [
    {
        icon: 'bi-calendar-check',
        color: 'primary',
        title: '任务管理',
        desc: '可视化配置定时任务（cron 表达式 / 固定时间 / 每周 / 每月 / 单次），支持脚本执行、超时控制、关注人通知。',
    },
    {
        icon: 'bi-clock-history',
        color: 'success',
        title: '任务实例',
        desc: '执行历史、实时日志、运行状态（pending / running / success / failed）全程可追溯，记录耗时、退出码、重试次数与触发方式。',
    },
    {
        icon: 'bi-diagram-3',
        color: 'info',
        title: '分布式调度',
        desc: 'master 调度 + node 执行的多节点模式，内置分布式锁防止任务在多个节点重复执行。',
    },
    {
        icon: 'bi-shield-lock',
        color: 'warning',
        title: '执行隔离',
        desc: '子进程执行器可真实中断超时 / 失控任务，崩溃不波及主服务，保障调度器稳定运行。',
    },
    {
        icon: 'bi-arrow-repeat',
        color: 'danger',
        title: '漏跑补偿',
        desc: '停机期间错过的触发点可自动补跑，支持合并补跑 / 全量补跑 / 跳过三种策略。',
    },
    {
        icon: 'bi-bell',
        color: 'secondary',
        title: '告警体系',
        desc: '内置多通道通知（服务日志 / Webhook / 企业微信 / 钉钉），覆盖失败、超时、连续失败、恢复、漏跑等场景。',
    },
    {
        icon: 'bi-hdd-network',
        color: 'primary',
        title: '灵活存储',
        desc: '默认使用本地 JSON 文件落盘（无需搭数据库）；设置 JSON_STORAGE=mysql 即切换为真实 MySQL，业务代码零改动。',
    },
    {
        icon: 'bi-person-badge',
        color: 'success',
        title: '统一鉴权',
        desc: '集成 SSO 单点登录（OIDC），并支持默认管理员账号播种，开箱即用。',
    },
    {
        icon: 'bi-file-earmark-code',
        color: 'info',
        title: 'API 文档',
        desc: '内置 Swagger，访问 {host}{prefix}/swagger-ui/index.html 即可浏览与调试全部接口。',
    },
    {
        icon: 'bi-box-seam',
        color: 'warning',
        title: '前后端一体',
        desc: '前端 Vue 3 + Vite 在构建期预渲染，由后端 Midway 统一托管，部署简单。',
    },
    {
        icon: 'bi-activity',
        color: 'danger',
        title: '健康度诊断',
        desc: '一键体检任务配置与运行表现，输出 0~100 健康分、结论与逐条修复建议。',
    },
    {
        icon: 'bi-graph-up',
        color: 'secondary',
        title: '运行监控',
        desc: '仪表板实时聚合任务统计、系统状态与最近执行记录，运行态势一目了然。',
    },
];

/** 执行方式 */
const scheduleTypes = [
    { type: '单次执行', value: '0', format: '2026-03-10 10:00:00' },
    { type: '每 N 秒', value: '1', format: '整数秒' },
    { type: '每 N 分钟', value: '2', format: '整数分钟' },
    { type: '每 N 小时', value: '3', format: '整数小时' },
    { type: '每天', value: '4', format: '10:00:00' },
    { type: '每周', value: '5', format: '1 10:00:00（1=周一）' },
    { type: '每月', value: '6', format: '15 10:00:00（无该日回退最近有效日）' },
    { type: '定时规则', value: '7', format: '5~7 段 cron 表达式' },
];

/** 执行器 */
const executors = [
    { type: '内联 JS', value: '0', note: '主进程内执行，兼容历史任务；无法强制中断，脚本卡死只能标记超时' },
    { type: '子进程 JS', value: '1', note: '独立进程执行，超时与人工终止可真 kill 进程组，崩溃不波及主服务（新建任务默认）' },
    { type: 'Shell', value: '2', note: '执行 shell 脚本' },
    { type: 'Python', value: '3', note: '执行 python 脚本' },
    { type: '外部命令', value: '4', note: '执行任意命令行' },
];

/** 可靠性机制 */
const reliability = [
    { icon: 'bi-crosshair', title: '精确唤醒', desc: '调度器按最近触发点自适应休眠（200ms ~ 30s），兼顾触发精度与空转开销。' },
    { icon: 'bi-skip-forward-btn', title: '漏跑补偿', desc: '服务停机期间错过的触发点会被准确统计并按配置补跑（once / all / skip）。' },
    { icon: 'bi-arrow-counterclockwise', title: '失败重试', desc: '任务失败后按配置的次数与间隔自动重试，重试次数记入实例。' },
    { icon: 'bi-exclamation-octagon', title: '连续失败告警', desc: '连续失败达到阈值（默认 3 次）触发告警，重新成功后自动发送恢复通知。' },
    { icon: 'bi-bug', title: '看门狗', desc: '兜底检测僵死实例并释放并发额度，避免个别挂死任务卡死整个调度器。' },
    { icon: 'bi-hand-index-thumb', title: '人工干预', desc: '运行中的实例可在列表页直接「终止」，强制结束其子进程。' },
];

/** 告警通道 */
const notifyChannels = [
    { name: 'log', desc: '写入服务日志（默认开启）' },
    { name: 'console', desc: '输出到控制台' },
    { name: 'webhook', desc: '通用 Webhook，POST JSON 报文' },
    { name: 'wecom', desc: '企业微信机器人（markdown 消息）' },
    { name: 'dingtalk', desc: '钉钉机器人（markdown 消息，配置 secret 后自动加签）' },
];

/** 技术栈 */
const techStack = [
    { layer: '后端', tech: 'Midway.js 3 (Koa)、TypeORM、MySQL、Swagger' },
    { layer: '前端', tech: 'Vue 3、Vite、Vue Router、Pinia、Bootstrap、no-vue3-cron' },
    { layer: '部署', tech: 'Docker / TARS' },
];

/** 目录结构 */
const directoryTree = `crontask/
├── src/                      # 后端 Midway 应用
│   ├── config/               # 配置（default / local / devops）
│   ├── controller/           # 接口层（account / task / instance / session / dashboard / home）
│   ├── service/              # 业务逻辑层
│   ├── model/                # TypeORM 实体（taskConfig / taskInstance / taskLock / user ...）
│   ├── filter/               # 全局异常过滤器
│   ├── middleware/           # 中间件（Chrome DevTools 噪声过滤等）
│   ├── initializers/         # 启动初始化（管理员账号播种等）
│   └── errors/               # 业务异常与响应码约定
├── web/                      # 前端 Vue 3 应用
│   ├── src/pages/            # 页面模块（管理端布局 / 页面 / 路由 / 主题样式）
│   ├── src/locales/          # 国际化语言包（zh-CN / en-US）
│   ├── src/components/       # 公共组件（DataGrid / Modal / Toast / LangSwitch）
│   └── vite.config.ts        # 构建配置（含开发代理修复）
├── data/
│   └── migrations/           # 数据库迁移脚本（幂等 SQL）
├── bin/                      # 构建 / 开发 / 迁移 / 打包脚本（Node）
├── bootstrap.js              # 生产启动入口
├── Dockerfile                # 镜像构建
└── .tpl.env                  # 环境变量模板`;

const loading = ref(false);

const loadSystemInfo = async () => {
    try {
        loading.value = true;
        const res = await getSystemInfo();
        if (res?.success) {
            systemInfo.value = res.data;
        }
    } catch (e) {
        console.error('获取系统信息失败', e);
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    loadSystemInfo();
});
</script>

<template>
    <div class="about-container">
        <!-- 头部 -->
        <div class="page-header">
            <div class="d-flex justify-content-between align-items-start flex-wrap gap-3">
                <div>
                    <div class="d-flex align-items-center gap-2 mb-1">
                        <i class="bi bi-calendar-check text-primary fs-3"></i>
                        <h1 class="h3 mb-0">CronTask 定时任务管理系统</h1>
                    </div>
                    <p class="text-muted mb-0">
                        基于 Midway.js + Vue 3 + TypeScript 的全栈分布式定时任务调度平台
                    </p>
                </div>
                <div class="d-flex gap-2 align-items-center">
                    <span class="badge bg-primary-subtle text-primary fs-6 px-3 py-2">
                        <i class="bi bi-tag-fill me-1"></i>v{{ systemInfo.version }}
                    </span>
                    <span class="badge bg-success-subtle text-success fs-6 px-3 py-2">
                        <i class="bi bi-patch-check-fill me-1"></i>MIT
                    </span>
                </div>
            </div>
        </div>

        <div class="about-content">
            <!-- 简介 -->
            <div class="card border-0 shadow-sm mb-4">
                <div class="card-body p-4">
                    <h5 class="card-title mb-3">
                        <i class="bi bi-info-circle me-2 text-primary"></i>项目简介
                    </h5>
                    <p class="text-secondary mb-3 lh-lg">
                        CronTask 提供一套轻量的定时任务管理方案：在 Web 界面中配置任务脚本、执行时间与超时策略，由后端统一调度并在多节点间通过分布式锁避免重复执行；每一次运行都会落库为任务实例，可随时回溯日志与状态。
                    </p>
                    <p class="text-secondary mb-0 lh-lg">
                        系统原生支持 <strong>MySQL 持久化</strong>，同时提供 <strong>本地 JSON 回退存储</strong>（无需数据库即可启动），方便本地开发与演示。鉴权集成 <strong>SSO 单点登录</strong>，并内置 Swagger 接口文档。
                    </p>
                </div>
            </div>

            <!-- 核心特性 -->
            <div class="card border-0 shadow-sm mb-4">
                <div class="card-body p-4">
                    <h5 class="card-title mb-4">
                        <i class="bi bi-stars me-2 text-primary"></i>核心特性
                    </h5>
                    <div class="row g-3">
                        <div
                            v-for="f in features"
                            :key="f.title"
                            class="col-xl-4 col-md-6"
                        >
                            <div class="feature-card h-100 p-3 rounded-3 border">
                                <div
                                    class="feature-icon rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
                                    :class="`bg-${f.color}-subtle text-${f.color}`"
                                >
                                    <i class="bi" :class="f.icon"></i>
                                </div>
                                <h6 class="fw-semibold mb-1">{{ f.title }}</h6>
                                <p class="text-secondary small mb-0 lh-base">{{ f.desc }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 调度能力 -->
            <div class="card border-0 shadow-sm mb-4">
                <div class="card-body p-4">
                    <h5 class="card-title mb-4">
                        <i class="bi bi-calendar-range me-2 text-primary"></i>调度增强能力
                    </h5>

                    <h6 class="fw-semibold mb-3 text-secondary">执行方式</h6>
                    <div class="table-responsive mb-4">
                        <table class="table table-hover align-middle mb-0">
                            <thead>
                                <tr>
                                    <th>类型</th>
                                    <th>值</th>
                                    <th>时间配置格式</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="s in scheduleTypes" :key="s.value">
                                    <td class="fw-medium">{{ s.type }}</td>
                                    <td><code>{{ s.value }}</code></td>
                                    <td class="text-secondary"><code>{{ s.format }}</code></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <h6 class="fw-semibold mb-3 text-secondary">执行器</h6>
                    <div class="table-responsive mb-4">
                        <table class="table table-hover align-middle mb-0">
                            <thead>
                                <tr>
                                    <th>类型</th>
                                    <th>值</th>
                                    <th>说明</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="e in executors" :key="e.value">
                                    <td class="fw-medium">{{ e.type }}</td>
                                    <td><code>{{ e.value }}</code></td>
                                    <td class="text-secondary small">{{ e.note }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <h6 class="fw-semibold mb-3 text-secondary">可靠性机制</h6>
                    <div class="row g-3">
                        <div
                            v-for="r in reliability"
                            :key="r.title"
                            class="col-lg-4 col-md-6"
                        >
                            <div class="reliability-item d-flex gap-2">
                                <i class="bi text-primary mt-1" :class="r.icon"></i>
                                <div>
                                    <div class="fw-medium small">{{ r.title }}</div>
                                    <div class="text-secondary small lh-base">{{ r.desc }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 健康度诊断 + 告警 -->
            <div class="row mb-4">
                <div class="col-lg-6 mb-4 mb-lg-0">
                    <div class="card border-0 shadow-sm h-100">
                        <div class="card-body p-4">
                            <h5 class="card-title mb-3">
                                <i class="bi bi-heart-pulse me-2 text-primary"></i>任务健康度诊断
                            </h5>
                            <p class="text-secondary small lh-base mb-3">
                                任务列表提供「诊断」按钮，一次性回答「这个任务为什么失败、为什么没跑、为什么不稳定」。
                            </p>
                            <ul class="list-unstyled mb-0 small text-secondary lh-lg">
                                <li><i class="bi bi-check2-circle text-success me-2"></i>配置体检：执行器、脚本缺失、超时非法、重试间隔、环境变量 JSON 等</li>
                                <li><i class="bi bi-check2-circle text-success me-2"></i>运行评估：采样最近 100 次实例，统计成功率、超时占比、平均 / 最大 / P95 耗时</li>
                                <li><i class="bi bi-check2-circle text-success me-2"></i>输出结论：0~100 健康分、一句话结论、逐条问题与修复建议</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="col-lg-6">
                    <div class="card border-0 shadow-sm h-100">
                        <div class="card-body p-4">
                            <h5 class="card-title mb-3">
                                <i class="bi bi-bell me-2 text-primary"></i>告警通道
                            </h5>
                            <p class="text-secondary small lh-base mb-3">
                                告警类型覆盖：执行失败、执行超时、启动失败、连续失败、任务恢复、任务漏跑、配置非法、系统异常。
                            </p>
                            <div class="d-flex flex-wrap gap-2 mb-3">
                                <span
                                    v-for="c in notifyChannels"
                                    :key="c.name"
                                    class="badge bg-light text-dark border px-3 py-2"
                                >
                                    <i class="bi bi-send me-1 text-primary"></i>{{ c.name }}
                                </span>
                            </div>
                            <p class="text-secondary small lh-base mb-0">
                                业务侧还可通过 <code>NotifyService</code> 暴露的 <code>alert</code> 事件钩子接入自有告警渠道。
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 技术栈 -->
            <div class="card border-0 shadow-sm mb-4">
                <div class="card-body p-4">
                    <h5 class="card-title mb-4">
                        <i class="bi bi-stack me-2 text-primary"></i>技术栈
                    </h5>
                    <div class="row g-3">
                        <div v-for="t in techStack" :key="t.layer" class="col-md-4">
                            <div class="p-3 rounded-3 bg-light h-100">
                                <div class="fw-semibold mb-1">{{ t.layer }}</div>
                                <div class="text-secondary small">{{ t.tech }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 目录结构 -->
            <div class="card border-0 shadow-sm mb-4">
                <div class="card-body p-4">
                    <h5 class="card-title mb-3">
                        <i class="bi bi-folder2-open me-2 text-primary"></i>目录结构
                    </h5>
                    <pre class="directory-tree mb-0"><code>{{ directoryTree }}</code></pre>
                </div>
            </div>

            <!-- 运行时信息 -->
            <div class="card border-0 shadow-sm">
                <div class="card-body p-4">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h5 class="card-title mb-0">
                            <i class="bi bi-cpu me-2 text-primary"></i>运行时信息
                        </h5>
                        <button class="btn btn-sm btn-outline-primary" :disabled="loading" @click="loadSystemInfo">
                            <i class="bi bi-arrow-clockwise me-1"></i>刷新
                        </button>
                    </div>
                    <div class="row g-3">
                        <div class="col-6 col-lg-3">
                            <div class="info-block">
                                <div class="text-muted small">系统版本</div>
                                <div class="fw-medium">v{{ systemInfo.version }}</div>
                            </div>
                        </div>
                        <div class="col-6 col-lg-3">
                            <div class="info-block">
                                <div class="text-muted small">运行时长</div>
                                <div class="fw-medium">{{ systemInfo.uptime }}</div>
                            </div>
                        </div>
                        <div class="col-6 col-lg-3">
                            <div class="info-block">
                                <div class="text-muted small">Node.js</div>
                                <div class="fw-medium">{{ systemInfo.nodeVersion || '-' }}</div>
                            </div>
                        </div>
                        <div class="col-6 col-lg-3">
                            <div class="info-block">
                                <div class="text-muted small">内存使用</div>
                                <div class="fw-medium">{{ systemInfo.memoryUsage }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.about-container {
    padding: 1.5rem;
    max-width: 1400px;
    margin: 0 auto;
}

.page-header {
    margin-bottom: 2rem;
}

.about-content {
    animation: fadeIn 0.5s ease-in-out;
}

.feature-card {
    background: var(--bs-body-bg);
    transition: all 0.3s ease;
}

.feature-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1);
}

.feature-icon {
    width: 44px;
    height: 44px;
    font-size: 1.25rem;
}

.reliability-item {
    padding: 0.5rem 0;
}

.info-block {
    padding: 0.75rem 1rem;
    background: var(--bs-light);
    border-radius: 0.5rem;
}

.directory-tree {
    background: #1e1e2e;
    color: #cdd6f4;
    padding: 1.25rem;
    border-radius: 0.5rem;
    font-size: 0.8rem;
    line-height: 1.5;
    overflow-x: auto;
}

.directory-tree code {
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    color: inherit;
    background: transparent;
}

.table th {
    border-top: none;
    font-weight: 600;
    color: var(--bs-secondary);
}

code {
    background: var(--bs-light);
    padding: 0.1rem 0.35rem;
    border-radius: 0.25rem;
    font-size: 0.85em;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 768px) {
    .about-container {
        padding: 1rem;
    }
}
</style>
