#!/usr/bin/env node

/**
 * @file 开发环境启动脚本
 * @description 跨平台（Windows / macOS / Linux）同时启动前后端开发服务器
 *
 * 架构说明：
 * - 浏览器访问 Midway（默认 8000），由其渲染 nunjucks 页面
 * - 页面内 <base href> 指向 Vite（默认 5173），前端模块/HMR 由 Vite 提供
 * - Vite 反代 /api 到 Midway（仅在直接访问 5173 时生效）
 *
 * 环境变量：
 * - PORT: 后端（Midway）端口，默认 8000，浏览器访问此端口（应用入口）
 * - VITE_PORT: 前端（Vite）端口，默认 5173，仅用于模块加载/HMR，不作为浏览器入口
 *
 * 端口被占用时：在 preferred~preferred+9 范围内可预测地递增查找，
 * 不会分配随机端口；若范围内全部被占用则明确报错退出（避免白屏）。
 */

const path = require('path');
const { spawn, execSync } = require('child_process');
const getPort = require('get-port');

// 加载项目根目录 .env（读取 PREFIX / PORT / VITE_PORT 等）。
// 子进程（Vite / Midway）会自行加载，这里仅用于本脚本计算端口与访问地址。
// override: true —— 让 .env 作为端口等配置的权威来源，
// 否则若运行环境已 export PORT=8000（如历史会话残留），dotenv 默认不覆盖，
// 会按 8000 去查找/占用端口，忽略 .env 里的 PORT 配置。
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), override: true });

/**
 * 查找可用端口：优先使用 preferred，被占用则 preferred+1 ... preferred+tryCount-1 递增。
 * 全部被占用时抛出明确错误（不分配随机端口，避免访问混乱）。
 *
 * 注意：get-port 在请求端口被占用时不会抛错，而是返回一个随机可用端口，
 * 因此必须校验其返回值是否等于候选端口，才能判断该端口确实空闲。
 *
 * 注意：host 必须与 Midway 实际监听的地址一致（Midway 默认监听 127.0.0.1，
 * 端口冲突报错也会显示 127.0.0.1）。用 0.0.0.0 探测在 macOS 上会和
 * 仅绑定 loopback 的残留进程“错过”，导致误判端口空闲、最终 EADDRINUSE。
 *
 * @param {number} preferred 优先端口
 * @param {number} tryCount 最大尝试个数
 * @returns {Promise<number>} 可用端口
 */
async function findFreePort(preferred, tryCount = 10) {
    for (let i = 0; i < tryCount; i++) {
        const candidate = preferred + i;
        const resolved = await getPort({ port: candidate, host: '127.0.0.1' });
        // getPort 仅在候选端口空闲时返回该端口本身，否则返回随机端口
        if (resolved === candidate) {
            return candidate;
        }
        // 被占用，尝试下一个
    }
    throw new Error(
        `端口 ${preferred} ~ ${preferred + tryCount - 1} 均被占用，` +
            `请先释放占用进程，或在 .env 中修改 PORT / VITE_PORT 后重试`
    );
}

/**
 * 启动前主动释放占用指定端口的进程（仅首选端口）。
 * 这样用户的预期端口（如 .env 里的 8000）能真正空出来被使用，
 * 而不是默默切换到其他端口；也从源头消除“残留进程反复占用”的问题。
 *
 * @param {number} port 目标端口
 */
function killPortOccupant(port) {
    try {
        if (process.platform === 'win32') {
            // Windows：netstat 找 PID 后 taskkill 强杀
            execSync(
                `for /f "tokens=5" %a in ('netstat -ano ^| findstr :${port}') do taskkill /F /PID %a`,
                { stdio: 'ignore' }
            );
        } else {
            // macOS / Linux：lsof 取监听该端口的 PID 后强杀
            execSync(`lsof -ti tcp:${port} -sTCP:LISTEN | xargs -r kill -9`, { stdio: 'ignore' });
        }
    } catch (_) {
        // 没有占用者或权限不足时忽略，交给后续 findFreePort 兜底
    }
}

(async () => {
    const preferredVitePort = parseInt(process.env.VITE_PORT, 10) || 5173;
    const preferredPort = parseInt(process.env.PORT, 10) || 8000;

    // 读取 .env 中的 PREFIX，用于拼接浏览器访问地址（如 /my-project）
    const prefix = process.env.PREFIX || '';
    const prefixUrl = prefix ? '/' + prefix : '';

    // 启动前先释放首选端口上的残留进程（如上次未干净退出的 Midway 子进程），
    // 确保预期端口可用；释放后 findFreePort 会优先命中首选端口。
    killPortOccupant(preferredVitePort);
    killPortOccupant(preferredPort);

    let vitePort;
    let port;
    try {
        [vitePort, port] = await Promise.all([
            findFreePort(preferredVitePort),
            findFreePort(preferredPort),
        ]);
    } catch (err) {
        console.error('[dev] ' + err.message);
        process.exit(1);
    }

    if (vitePort !== preferredVitePort) {
        console.log(`[dev] 前端端口 ${preferredVitePort} 被占用，已切换到 ${vitePort}`);
    }
    if (port !== preferredPort) {
        console.log(`[dev] 后端端口 ${preferredPort} 被占用，已切换到 ${port}（Vite 反代会同步更新）`);
    }

    const env = {
        ...process.env,
        PORT: String(port),
        VITE_PORT: String(vitePort),
        IP: process.env.IP || '127.0.0.1',
    };

    console.log('');
    console.log('  ✅ 应用入口（浏览器访问）： http://127.0.0.1:' + port + prefixUrl + '/');
    console.log('  ✅ Vite 模块服务（HMR）：    http://127.0.0.1:' + vitePort);
    console.log('  ✅ 后端 API：               http://127.0.0.1:' + port + prefixUrl + '/api');
    console.log('');

    // Windows 下 npm 是 .cmd，必须经由 shell 执行
    // unix 下用 detached 让 npm 成为新进程组 leader，
    // 退出时 kill(-pid) 能连同 midway-bin → ts-node 子进程一起杀掉，
    // 避免残留进程继续占用端口（这是之前反复 EADDRINUSE 的真正根源）。
    const child = spawn('npm', ['run', 'dev:all'], {
        stdio: 'inherit',
        shell: process.platform === 'win32',
        env,
        detached: process.platform !== 'win32',
    });

    let shuttingDown = false;
    function gracefulShutdown(signal) {
        if (shuttingDown) return;
        shuttingDown = true;
        try {
            if (process.platform !== 'win32' && child.pid) {
                process.kill(-child.pid, signal); // 杀掉整个进程组
            } else if (child.pid) {
                child.kill(signal);
            }
        } catch (_) {
            // 子进程已退出则忽略
        }
    }
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

    child.on('exit', (code) => {
        process.exit(code === null ? 0 : code);
    });

    child.on('error', (err) => {
        console.error('[dev] 启动失败:', err.message);
        process.exit(1);
    });
})();
