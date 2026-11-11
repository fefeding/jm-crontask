# CronTask 定时任务管理系统

> 基于 **Midway.js + Vue 3 + TypeScript** 的全栈分布式定时任务调度平台，支持任务的可视化配置、调度执行、运行监控与多节点部署。

[![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

---

## 简介

CronTask 提供一套轻量的定时任务管理方案：在 Web 界面中配置任务脚本、执行时间与超时策略，由后端统一调度并在多节点间通过分布式锁避免重复执行；每一次运行都会落库为任务实例，可随时回溯日志与状态。

系统原生支持 **MySQL 持久化**，同时提供 **本地 JSON 回退存储**（无需数据库即可启动），方便本地开发与演示。鉴权集成 **SSO 单点登录**，并内置 Swagger 接口文档。

## 5 分钟快速启动

**无需 MySQL** —— 模板 `.tpl.env` 默认已设 `JSON_STORAGE=local`，开箱即用本地 JSON 存储。

```bash
# 1. 安装依赖（后端 + 前端）
npm run init

# 2. 生成本地环境变量文件
cp .tpl.env .env
#    然后修改 .env：设置 DEFAULT_ADMIN_PASSWORD=admin123、SSO_ENABLED=false

# 3. 启动前后端
npm run dev
```

访问 **http://localhost:8000/** ，用默认管理员账号登录（密码即 `DEFAULT_ADMIN_PASSWORD`）。

> 想用 MySQL？在 `.env` 中把 `JSON_STORAGE` 改为 `mysql`，并填好 `DB_HOST` / `DB_USERNAME` / `DB_PASSWORD` / `DB_DATABASE`，然后在 `npm run dev` 前先执行 `npm run db:migrate`。

## 特性

- **任务管理**：可视化配置定时任务（cron 表达式 / 固定时间 / 每周 / 每月 / 单次），支持脚本执行、超时控制、关注人通知。
- **任务实例**：执行历史、实时日志、运行状态（`pending` / `running` / `success` / `failed`）全程可追溯，实例记录耗时、退出码、重试次数与触发方式。
- **分布式调度**：master 调度 + node 执行的多节点模式，内置分布式锁防止任务重复执行。
- **执行隔离**：子进程执行器可真实中断超时/失控任务，崩溃不波及主服务。
- **漏跑补偿**：停机期间错过的触发点可自动补跑，支持合并补跑 / 全量补跑 / 跳过三种策略。
- **告警体系**：内置多通道通知（服务日志 / Webhook / 企业微信 / 钉钉），覆盖失败、超时、连续失败、恢复、漏跑等场景。
- **灵活存储**：默认使用本地 JSON 文件落盘（无需搭数据库）；设置 `JSON_STORAGE=mysql` 即切换为真实 MySQL，业务代码零改动。
- **统一鉴权**：集成 SSO 单点登录，并支持默认管理员账号播种。
- **API 文档**：内置 Swagger，访问 `{host}{prefix}/swagger-ui/index.html`。
- **前后端一体**：前端 Vue 3 + Vite 在构建期预渲染，由后端 Midway 统一托管，部署简单。

## 调度增强能力

### 执行方式

| 类型 | 值 | 时间配置格式 |
| --- | --- | --- |
| 单次执行 | `0` | `2026-03-10 10:00:00` |
| 每 N 秒 | `1` | 整数秒 |
| 每 N 分钟 | `2` | 整数分钟 |
| 每 N 小时 | `3` | 整数小时 |
| 每天 | `4` | `10:00:00` |
| 每周 | `5` | `1 10:00:00`（1=周一） |
| 每月 | `6` | `15 10:00:00`（当月无该日期时回退到最近有效日） |
| 定时规则 | `7` | 5~7 段 cron 表达式 |

### 执行器

| 类型 | 值 | 说明 |
| --- | --- | --- |
| 内联 JS | `0` | 主进程内执行，兼容历史任务；**无法强制中断**，脚本卡死只能标记超时 |
| 子进程 JS | `1` | 独立进程执行，**超时与人工终止可真 kill 进程组**，崩溃不波及主服务（**新建任务默认**） |
| Shell | `2` | 执行 shell 脚本 |
| Python | `3` | 执行 python 脚本 |
| 外部命令 | `4` | 执行任意命令行 |

### 可靠性机制

- **精确唤醒**：调度器按最近触发点自适应休眠（200ms ~ 30s），兼顾触发精度与空转开销。
- **漏跑补偿**：服务停机期间错过的触发点会被准确统计，并按任务配置补跑（`once` 合并补跑一次 / `all` 全量补跑 / `skip` 跳过）。
- **失败重试**：任务失败后按配置的次数与间隔自动重试，重试次数记入实例。
- **连续失败告警**：连续失败达到阈值（默认 3 次）触发告警，重新成功后自动发送恢复通知。
- **看门狗**：兜底检测僵死实例并释放并发额度，避免个别挂死任务卡死整个调度器。
- **人工干预**：运行中的实例可在列表页直接「终止」，强制结束其子进程。

### 告警通道

`src/config/config.default.ts` 的 `notify.channels` 支持以下通道：

| 通道 | 说明 |
| --- | --- |
| `log` | 写入服务日志（默认开启） |
| `console` | 输出到控制台 |
| `webhook` | 通用 Webhook，POST JSON 报文 |
| `wecom` | 企业微信机器人（markdown 消息） |
| `dingtalk` | 钉钉机器人（markdown 消息，配置 `secret` 后自动加签） |

告警类型覆盖：执行失败、执行超时、启动失败、连续失败、任务恢复、任务漏跑、配置非法、系统异常。
业务侧还可通过 `NotifyService` 暴露的 `alert` 事件钩子接入自有告警渠道：

```ts
notifyService.on('alert', payload => {
    // payload: { type, title, content, taskId, taskName, instanceId, receivers, time }
});
```

## 技术栈

| 层 | 技术 |
| --- | --- |
| 后端 | Midway.js 3 (Koa)、TypeORM、MySQL、Swagger |
| 前端 | Vue 3、Vite、Vue Router、Pinia、Bootstrap、no-vue3-cron |
| 部署 | Docker / TARS |

## 目录结构

```
crontask/
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
│   ├── src/views/            # 页面（任务管理、实例监控、仪表盘等）
│   ├── src/router/           # 前端路由
│   └── vite.config.ts        # 构建配置（含开发代理修复）
├── data/
│   └── migrations/           # 数据库迁移脚本（幂等 SQL）
├── bin/                      # 构建 / 开发 / 迁移 / 打包脚本（Node）
├── bootstrap.js              # 生产启动入口
├── Dockerfile                # 镜像构建
└── .tpl.env                  # 环境变量模板
```

## 快速开始

### 环境要求

- Node.js **>= 20**
- MySQL **5.7+**（可选；可用本地 JSON 回退存储替代）

### 1. 安装依赖

```bash
# 一键安装后端 + 前端依赖（优先 pnpm，回退 npm）
npm run init

# 或分别安装
npm install
cd web && npm install
```

### 2. 配置环境变量

复制模板生成本地 `.env` 后再修改：

```bash
cp .tpl.env .env
```

> 每个变量在 `.tpl.env` 中都有行内注释。最关键的两个开关是 `JSON_STORAGE`（使用哪种存储）与 `SSO_ENABLED`（登录是否走 SSO）。

#### 极速启动 —— 无需数据库

`JSON_STORAGE=local`（`.tpl.env` 的默认值）即可完全基于本地 JSON 文件运行，**无需安装 MySQL**。最小化 `.env`：

```env
PORT=8000
PREFIX=
TITLE=定时任务系统
JSON_STORAGE=local
DEFAULT_ADMIN_PASSWORD=admin123
# 本地体验可关闭 SSO，直接用默认管理员账号登录
SSO_ENABLED=false
```

用这份配置可**跳过第 3 步（数据库迁移）**，直接执行 `npm run dev`。首次启动会自动播种默认管理员账号。

#### 类生产 —— 使用 MySQL

将 `JSON_STORAGE` 设为 `mysql`，填好 MySQL 连接，并在第 3 步执行迁移：

```env
PORT=8000
PREFIX=
TITLE=定时任务系统
JSON_STORAGE=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=yourpassword
DB_DATABASE=db_crontask
DEFAULT_ADMIN_PASSWORD=admin123
SSO_ENABLED=true
SSO_BASE_URL=https://your-sso.example.com/sso
SSO_CLIENT_ID=your-client-id
SSO_CLIENT_SECRET=your-client-secret
```

常用配置项（详见 `.tpl.env` 注释）：

| 变量 | 说明 | 默认值 |
| --- | --- | --- |
| `PORT` | 后端服务端口（浏览器访问此端口） | `8000` |
| `VITE_PORT` | 前端 Vite 端口（仅用于模块加载 / HMR，非入口） | `5173` |
| `PREFIX` | 部署子路径前缀（根路径留空，如 `crontask`） | 空 |
| `TITLE` | 系统标题 | `定时任务系统` |
| `JSON_STORAGE` | `local` = 本地 JSON 文件（无需 MySQL）；`mysql` = 真实数据库 | `local` |
| `DB_HOST` / `DB_PORT` / `DB_USERNAME` / `DB_PASSWORD` / `DB_DATABASE` | MySQL 连接信息（仅 `JSON_STORAGE=mysql` 时生效） | — |
| `DEFAULT_ADMIN_PASSWORD` | 管理员初始密码（首次启动播种 `baseService.manager` 账号） | 空 |
| `SSO_*` | 单点登录（OIDC）相关配置 | — |

调度相关环境变量（均有默认值，按需覆盖）：

| 变量 | 说明 | 默认值 |
| --- | --- | --- |
| `TASK_NODE` | 是否作为节点执行任务（`0` / `false` 表示只做 master） | `true` |
| `TASK_MIN_INTERVAL` | 调度器最小轮询间隔（毫秒） | `200` |
| `TASK_MAX_INTERVAL` | 调度器最大轮询间隔（毫秒），无任务时休眠到此长度 | `30000` |
| `TASK_MAX_RUNNING` | 单节点最大并发执行任务数 | `5` |
| `TASK_MAX_CATCH_UP` | 单次补偿的最大执行次数 | `10` |
| `TASK_WORK_ROOT` | 任务执行临时工作目录根路径 | `<root>/data/exec` |
| `TASK_DATA_ROOT` | 数据根目录（日志、产物备份、临时目录的父目录） | `<root>/data` |
| `TASK_INSTANCE_RETENTION` | 实例记录保留天数（`0` 表示不清理） | `30` |
| `TASK_LOG_RETENTION` | 日志文件保留天数（`0` 表示不清理） | `30` |
| `TASK_PUBLISH_RETENTION` | 产物备份保留天数（`0` 表示不清理） | `30` |
| `TASK_MAINTAIN` | 是否开启维护任务（归档清理），`0` 关闭 | `true` |
| `TASK_MAINTAIN_INTERVAL` | 维护周期（毫秒） | `3600000` |

> 安全提示：`.env` 含密钥，已被 `.gitignore` 忽略，请勿提交到仓库。

### 3. 初始化数据库（使用 MySQL 时）

表结构变更统一走迁移脚本，幂等、可重复执行：

```bash
npm run db:migrate
```

（使用 `JSON_STORAGE=local` 时无需此步骤，数据直接落盘 JSON 文件。）

### 4. 本地开发

```bash
npm run dev        # 同时启动前后端（前端 Vite :5173，页面经后端 :8000 访问）
npm run dev:midway # 仅后端
npm run dev:vue    # 仅前端
```

启动后访问 **http://localhost:8000/**（从后端端口进入；Vite 端口仅提供模块热更新，直接打开会白屏）。

### 5. 构建与运行

```bash
npm run build      # 构建前后端到 dist/
npm start          # 以 pm2 启动（crontask-server）
```

## 部署

- **Docker**

  ```bash
  docker build -t crontask .
  docker run -d -p 8000:8000 -v $(pwd)/.env:/app/.env --name crontask crontask
  ```

- **TARS**：`npm run tars:deploy`

## 常用脚本

| 脚本 | 作用 |
| --- | --- |
| `npm run dev` | 本地前后端联调 |
| `npm run build` | 构建前后端 |
| `npm run db:migrate` | 执行数据库迁移 |
| `npm test` / `npm run cov` | 单元测试 / 覆盖率 |
| `npm run lint` / `npm run lint:fix` | 代码风格检查 / 自动修复 |

## 开发规范

- 代码风格由 `mwts`（基于 ESLint）约束，提交前请执行 `npm run lint`。
- 表结构变更请新增 `data/migrations/*.sql`，**不要**使用 `DROP TABLE`，避免迁移执行时清空生产数据；`synchronize` 已关闭，不依赖 TypeORM 自动同步。
- 前端业务依赖（ace、no-vue3-cron、vuex、tailwind 等）为项目特有，请勿随模板升级被误删。

## 常见问题排查

| 现象 | 原因 / 解决办法 |
| --- | --- |
| `npm run dev` 后页面空白 | `.env` 中 `VITE_PORT` 缺失或配错 —— 后端据此渲染 `<base href>`。请从**后端**端口（如 `:8000`）访问，而不是 Vite 端口。 |
| 连接 MySQL 报 `ECONNREFUSED` | `DB_HOST` 已配置但 MySQL 不可达。要么启动 MySQL，要么清空 `DB_HOST`（留空即自动回退本地 JSON 存储）。 |
| 登录失败 / 账号不存在 | 未配置 `DEFAULT_ADMIN_PASSWORD`，默认管理员账号未被播种。配置后重启即可。 |
| SSO 跳转失败 | `SSO_BASE_URL` / `SSO_CLIENT_ID` / `SSO_CLIENT_SECRET` 缺失，或回调地址未在 SSO 系统中加入白名单。 |
| `EADDRINUSE` / 端口被占用 | 修改 `.env` 中的 `PORT`（后端）或 `VITE_PORT`（前端）。 |
| 任务未按计划执行 | 检查任务的调度表达式与时区设置，并确认调度器已启用（`LOG_LEVEL=debug` 可看到调度日志）。 |

## 许可

[MIT](./LICENSE) © yc_null
