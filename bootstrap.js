/**
 * @file 生产环境启动入口
 * @description Node.js 生产环境启动脚本，使用 PM2 进程管理
 * @author fefeding
 *
 * 启动方式：
 * - 直接运行：node bootstrap.js
 * - PM2 管理：npm start / npm restart / npm stop
 *
 * 环境变量：
 * - PORT: 服务端口（默认 8000）
 * - IP: 监听地址（默认 127.0.0.1）
 * - SERVICE_NAME: 服务名称（用于 TARS 部署）
 */
const package = require('./package.json');
const path = require('node:path');
const dotenv = require('dotenv');
const net = require('node:net');

process.env.NODE_ENV = 'production';
dotenv.config({ path: path.join(__dirname, '.env') });
process.title = process.env.SERVICE_NAME =
    process.env.SERVICE_NAME || package.name || 'ycnull-server';

// 全局异常处理：记录日志但不退出进程（让 PM2 重启）
process.on('uncaughtException', err => {
    console.error('[FATAL] uncaughtException:', err);
    // 开发环境遇到端口占用必须立即退出，避免僵尸进程持续持有端口，
    // 导致 Midway auto reload 在 Windows 下反复 EADDRINUSE。
    if (err.code === 'EADDRINUSE' && process.env.NODE_ENV !== 'production') {
        process.exit(1);
    }
    // 生产环境可选择不立即退出，让 Tars 主进程检测到后重启
});

// 未处理的 Promise 拒绝
process.on('unhandledRejection', (reason, promise) => {
    console.error('[FATAL] unhandledRejection at:', promise, 'reason:', reason);
});

/**
 * 等待端口可用（Windows 开发环境兜底）
 * Midway auto reload 在 Windows 下旧进程 socket 释放存在延迟，
 * 新进程启动前短暂轮询可避免 EADDRINUSE。
 */
function waitForPortAvailable(port, host = '127.0.0.1', maxWaitMs = 3000) {
    const checkInterval = 200;
    const maxAttempts = Math.ceil(maxWaitMs / checkInterval);

    return new Promise(resolve => {
        let attempt = 0;
        const check = () => {
            const server = net.createServer();
            server.unref();
            server.once('error', () => {
                attempt += 1;
                if (attempt >= maxAttempts) {
                    resolve(false);
                    return;
                }
                setTimeout(check, checkInterval);
            });
            server.listen({ port, host, exclusive: true }, () => {
                server.close(err => resolve(!err));
            });
        };
        check();
    });
}

// 启动 Midway 应用
(async () => {
    const port = Number(process.env.PORT) || 7001;
    const host = process.env.IP || '127.0.0.1';

    // Windows 开发环境：旧进程端口释放有延迟，启动前短暂等待
    if (process.platform === 'win32' && process.env.NODE_ENV !== 'production') {
        const free = await waitForPortAvailable(port, host);
        if (!free) {
            console.warn(
                `[Bootstrap] 端口 ${port} 在 ${host} 上持续被占用，尝试继续启动...`
            );
        }
    }

    const { Bootstrap } = require('@midwayjs/bootstrap');
    Bootstrap.run().then(() => {
        console.log('server start at http://%s:%d', host, port);
    });
})();
