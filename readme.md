# CronTask — Distributed Cron Job Management System

> A full-stack, distributed scheduled-task platform built on **Midway.js + Vue 3 + TypeScript**, with visual task configuration, scheduling/execution, and runtime monitoring.

[![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

---

## Introduction

CronTask provides a lightweight scheduled-task solution: configure task scripts, execution schedules, and timeout policies from a web UI; the backend schedules them uniformly and uses distributed locks across nodes to avoid duplicate execution. Every run is persisted as a task instance, so its logs and status can be traced at any time.

The system uses **MySQL** for persistence by default, and also offers a **local JSON fallback storage** (runs without a database) for convenient local development and demos. Authentication integrates **SSO** single sign-on and supports seeding a default admin account. An embedded **Swagger** API doc is included.

## Quick Start in 5 Minutes

**No MySQL needed** — the shipped `.tpl.env` already sets `JSON_STORAGE=local`, so the app starts on local JSON storage right away.

```bash
# 1. Install dependencies (backend + frontend)
npm run init

# 2. Create your local env file
cp .tpl.env .env
#    then edit .env: set DEFAULT_ADMIN_PASSWORD=admin123 and SSO_ENABLED=false

# 3. Start backend + frontend
npm run dev
```

Open **http://localhost:8000/** and sign in with the default admin account (password = `DEFAULT_ADMIN_PASSWORD`).

> Prefer MySQL? Set `JSON_STORAGE=mysql` in `.env`, fill in `DB_HOST` / `DB_USERNAME` / `DB_PASSWORD` / `DB_DATABASE`, then run `npm run db:migrate` before `npm run dev`.

## Features

- **Task management**: visually configure scheduled tasks (cron expression / fixed time), with script execution, timeout control, and watcher notifications.
- **Task instances**: full traceability of execution history, real-time logs, and statuses (`pending` / `running` / `success` / `failed`).
- **Distributed scheduling**: master-schedule + node-execute multi-node mode, with a built-in distributed lock to prevent duplicate execution.
- **Flexible storage**: local JSON files by default (no database setup required); set `JSON_STORAGE=mysql` to switch to a real MySQL database — zero business-code changes either way.
- **Unified auth**: SSO single sign-on integration, plus default admin account seeding.
- **API docs**: embedded Swagger, available at `{host}{prefix}/swagger-ui/index.html`.
- **Frontend/backend in one**: the Vue 3 + Vite frontend is pre-rendered at build time and served by the Midway backend, making deployment simple.

## Scheduling Capabilities

### Execution Modes

| Type | Value | Schedule format |
| --- | --- | --- |
| One-shot | `0` | `2026-03-10 10:00:00` |
| Every N seconds | `1` | integer seconds |
| Every N minutes | `2` | integer minutes |
| Every N hours | `3` | integer hours |
| Daily | `4` | `10:00:00` |
| Weekly | `5` | `1 10:00:00` (1 = Monday) |
| Monthly | `6` | `15 10:00:00` (falls back to the nearest valid day in shorter months) |
| Cron rule | `7` | 5~7 segment cron expression |

### Executors

| Type | Value | Description |
| --- | --- | --- |
| Inline JS | `0` | Runs inside the main process, compatible with legacy tasks; **cannot be forcibly interrupted** — a stuck script can only be marked as timed out |
| Subprocess JS | `1` | Runs in a separate process; **timeouts and manual termination can really kill the process group**, and a crash never affects the main service (**default for new tasks**) |
| Shell | `2` | Runs a shell script |
| Python | `3` | Runs a python script |
| External command | `4` | Runs an arbitrary command line |

### Reliability Mechanisms

- **Precise wake-up**: the scheduler sleeps adaptively based on the nearest trigger point (200ms ~ 30s), balancing trigger accuracy against idle overhead.
- **Missed-run compensation**: trigger points missed while the service was down are counted accurately and replayed per the task configuration (`once` merges them into a single run / `all` replays all of them / `skip` ignores them).
- **Failure retry**: a failed task is retried automatically using the configured count and interval; retry attempts are recorded on the instance.
- **Consecutive-failure alerting**: reaching the failure threshold (3 by default) raises an alert, and a recovery notification is sent once the task succeeds again.
- **Watchdog**: detects deadlocked instances and releases concurrency quota as a fallback, so one hung task cannot stall the whole scheduler.
- **Manual intervention**: a running instance can be terminated directly from the list page, forcefully killing its child process.

### Alert Channels

`notify.channels` in `src/config/config.default.ts` supports the following channels:

| Channel | Description |
| --- | --- |
| `log` | Writes to the service log (enabled by default) |
| `console` | Prints to stdout |
| `webhook` | Generic webhook, POSTs a JSON payload |
| `wecom` | WeCom (Enterprise WeChat) robot (markdown message) |
| `dingtalk` | DingTalk robot (markdown message, signed automatically once `secret` is configured) |

Alert types cover: execution failure, execution timeout, start failure, consecutive failures, task recovery, missed runs, invalid configuration, and system exceptions.

Business code can also plug into custom alert channels through the `alert` event exposed by `NotifyService`:

```ts
notifyService.on('alert', payload => {
    // payload: { type, title, content, taskId, taskName, instanceId, receivers, time }
});
```

## Tech Stack

| Layer | Technology |
| --- | --- |
| Backend | Midway.js 3 (Koa), TypeORM, MySQL, Swagger |
| Frontend | Vue 3, Vite, Vue Router, Pinia, Bootstrap, no-vue3-cron |
| Deployment | Docker / TARS |

## Directory Structure

```
crontask/
├── src/                      # Backend Midway application
│   ├── config/               # Configuration (default / local / devops)
│   ├── controller/           # API layer (account / task / instance / session / dashboard / home)
│   ├── service/              # Business logic layer
│   ├── model/                # TypeORM entities (taskConfig / taskInstance / taskLock / user ...)
│   ├── filter/               # Global exception filters
│   ├── middleware/           # Middlewares (e.g. Chrome DevTools noise filter)
│   ├── initializers/         # Startup initializers (admin account seeding, etc.)
│   └── errors/               # Business exceptions and response codes
├── web/                      # Frontend Vue 3 application
│   ├── src/views/            # Pages (task management, instance monitoring, dashboard, ...)
│   ├── src/router/           # Frontend routes
│   └── vite.config.ts        # Build config (with dev-proxy fix)
├── data/
│   └── migrations/           # Database migration scripts (idempotent SQL)
├── bin/                      # Build / dev / migrate / package scripts (Node)
├── bootstrap.js              # Production entry
├── Dockerfile                # Image build
└── .tpl.env                  # Environment variable template
```

## Quick Start

### Requirements

- Node.js **>= 20**
- MySQL **5.7+** (optional; can be replaced by local JSON fallback storage)

### 1. Install dependencies

```bash
# Install backend + frontend dependencies in one go (prefers pnpm, falls back to npm)
npm run init

# Or install separately
npm install
cd web && npm install
```

### 2. Configure environment variables

Copy the template to create your local `.env`, then edit it:

```bash
cp .tpl.env .env
```

> Every variable is documented inline in `.tpl.env`. The two decisive switches are `JSON_STORAGE` (which storage backend to use) and `SSO_ENABLED` (whether login goes through SSO).

#### Fastest start — no database required

`JSON_STORAGE=local` (the default in `.tpl.env`) runs the app entirely on local JSON files. **No MySQL installation needed.** A minimal `.env`:

```env
PORT=8000
PREFIX=
TITLE=定时任务系统
JSON_STORAGE=local
DEFAULT_ADMIN_PASSWORD=admin123
# SSO is optional for a local try-out; disable it to log in with the default admin
SSO_ENABLED=false
```

With this, **skip step 3** (database migration) and run `npm run dev` directly. The app seeds a default admin account on first boot.

#### Production-like — with MySQL

Set `JSON_STORAGE=mysql`, fill in the MySQL connection, and run the migration in step 3:

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

Common variables (see `.tpl.env` for the full list):

| Variable | Description | Default |
| --- | --- | --- |
| `PORT` | Backend service port (access the app on this port) | `8000` |
| `VITE_PORT` | Frontend Vite port (modules / HMR only, not the entry) | `5173` |
| `PREFIX` | Deployment sub-path prefix (leave empty for root, e.g. `crontask`) | empty |
| `TITLE` | System title | `定时任务系统` |
| `JSON_STORAGE` | `local` = local JSON files (no MySQL); `mysql` = real database | `local` |
| `DB_HOST` / `DB_PORT` / `DB_USERNAME` / `DB_PASSWORD` / `DB_DATABASE` | MySQL connection (only used when `JSON_STORAGE=mysql`) | — |
| `DEFAULT_ADMIN_PASSWORD` | Initial admin password (seeds `baseService.manager` accounts on first boot) | empty |
| `SSO_*` | Single sign-on (OIDC) related configuration | — |

> Security note: `.env` contains secrets and is already ignored by `.gitignore`. Do not commit it.

### 3. Initialize the database (when using MySQL)

Schema changes go through migration scripts, which are idempotent and safe to re-run:

```bash
npm run db:migrate
```

(Not needed when using `JSON_STORAGE=local`; data is persisted to JSON files directly.)

### 4. Local development

```bash
npm run dev        # Start backend + frontend together (Vite :5173, page served via backend :8000)
npm run dev:midway # Backend only
npm run dev:vue    # Frontend only
```

Then open **http://localhost:8000/** (enter via the backend port; the Vite port only serves module hot-reload — opening it directly shows a blank page).

### 5. Build and run

```bash
npm run build      # Build backend + frontend into dist/
npm start          # Start with pm2 (crontask-server)
```

## Deployment

- **Docker**

  ```bash
  docker build -t crontask .
  docker run -d -p 8000:8000 -v $(pwd)/.env:/app/.env --name crontask crontask
  ```

- **TARS**: `npm run tars:deploy`

## Common Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Local frontend/backend dev |
| `npm run build` | Build frontend + backend |
| `npm run db:migrate` | Run database migrations |
| `npm test` / `npm run cov` | Unit tests / coverage |
| `npm run lint` / `npm run lint:fix` | Code style check / auto-fix |

## Development Guidelines

- Code style is enforced by `mwts` (ESLint-based); run `npm run lint` before committing.
- Schema changes should add `data/migrations/*.sql` — **do not** use `DROP TABLE`, to avoid wiping production data during migration. `synchronize` is disabled and does not rely on TypeORM auto-sync.
- Frontend business dependencies (ace, no-vue3-cron, vuex, tailwind, etc.) are project-specific; do not let template upgrades remove them by mistake.

## Troubleshooting

| Symptom | Cause / Fix |
| --- | --- |
| Blank page after `npm run dev` | `VITE_PORT` is missing or wrong in `.env` — the backend renders `<base href>` from it. Access the app through the **backend** port (e.g. `:8000`), not the Vite port. |
| `ECONNREFUSED` while connecting to MySQL | `DB_HOST` is set but MySQL is unreachable. Either start MySQL, or clear `DB_HOST` (empty ⇒ automatic JSON fallback storage). |
| Login fails / account not found | `DEFAULT_ADMIN_PASSWORD` is unset, so the admin account was never seeded. Set it and restart. |
| SSO redirect fails | `SSO_BASE_URL` / `SSO_CLIENT_ID` / `SSO_CLIENT_SECRET` are missing, or the callback URL is not whitelisted in the SSO system. |
| `EADDRINUSE` / port already in use | Change `PORT` (backend) or `VITE_PORT` (frontend) in `.env`. |
| Task does not run on schedule | Check the task's schedule expression and timezone, and confirm the scheduler is enabled (`LOG_LEVEL=debug` shows scheduling logs). |

## License

[MIT](./LICENSE) © yc_null
