import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as moment from 'moment';
import axios from 'axios';
import * as jsruntime from 'jm-jsruntime';
import { TaskExecType } from '../model/taskConst';

/** 单次执行允许保留的最大日志量（字节），超出部分丢弃并提示 */
export const MAX_LOG_SIZE = 512 * 1024;

export interface ExecOptions {
    /** 任务配置 */
    task: any;
    /** 任务实例 */
    instance: any;
    /** 超时时间（秒），0 表示不限制 */
    timeout: number;
    /** 临时工作目录根 */
    workRoot: string;
    /** 额外环境变量 */
    env?: Record<string, string>;
    /** 子进程内 require 的模块白名单 */
    requireAllowList?: string[];
    /** 子进程启动回调（用于记录 pid，便于超时强制回收） */
    onSpawn?: (pid: number) => void;
}

export interface ExecResult {
    /** 执行结果 */
    status: 'success' | 'failed' | 'timeout';
    /** 退出码 */
    exitCode: number;
    /** 提示信息 */
    message: string;
    /** 耗时（毫秒） */
    duration: number;
    /** 采集到的日志 */
    log: string;
}

/**
 * 日志收集器：控制总量，避免超长日志撑爆内存与数据库
 */
class LogCollector {
    private chunks: string[] = [];
    private size = 0;
    private truncated = false;

    append(type: string, text: string) {
        if (this.size >= MAX_LOG_SIZE) {
            if (!this.truncated) {
                this.truncated = true;
                this.chunks.push(
                    '\n[日志超过 ' + MAX_LOG_SIZE + ' 字节，后续内容已丢弃]\n'
                );
            }
            return;
        }
        const line = `[${type}] ${text}\n`;
        this.size += line.length;
        this.chunks.push(line);
    }

    get content(): string {
        return this.chunks.join('');
    }
}

/**
 * 序列化日志参数
 */
function serializeArg(obj: any): string {
    try {
        if (obj === null || obj === undefined) return String(obj);
        if (typeof obj === 'object') return JSON.stringify(obj);
        return obj.toString();
    } catch (e) {
        return '[无法序列化]';
    }
}

/**
 * 生成注入给内联脚本的 console 实现
 */
function createVConsole(collector: LogCollector) {
    const write = (type: string, args: any[]) => {
        collector.append(type, (args || []).map(serializeArg).join(' '));
    };
    return {
        info: (...args: any[]) => write('info', args),
        log: (...args: any[]) => write('info', args),
        debug: (...args: any[]) => write('debug', args),
        warn: (...args: any[]) => write('warn', args),
        error: (...args: any[]) => write('error', args),
        write: (type: string, ...args: any[]) => write(type, args),
    };
}

/**
 * 子进程引导脚本模板
 *
 * 在独立进程中执行用户脚本，天然隔离崩溃与内存泄漏，
 * 并可通过进程信号实现真实超时中断。
 */
const BOOTSTRAP_TEMPLATE = `
const fs = require('fs');

const scriptPath = process.argv[2];
const payloadPath = process.argv[3];

let payload = {};
try {
    payload = JSON.parse(fs.readFileSync(payloadPath, 'utf8'));
} catch (e) {
    payload = {};
}

function serialize(v) {
    try {
        if (v === null || v === undefined) return String(v);
        if (typeof v === 'object') return JSON.stringify(v);
        return v.toString();
    } catch (e) {
        return '[unserializable]';
    }
}

function write(type, args) {
    const text = (args || []).map(serialize).join(' ');
    if (type === 'error' || type === 'warn') {
        process.stderr.write('[' + type + '] ' + text + '\\n');
    } else {
        process.stdout.write('[' + type + '] ' + text + '\\n');
    }
}

const vconsole = {
    info: function() { write('info', Array.prototype.slice.call(arguments)); },
    log: function() { write('info', Array.prototype.slice.call(arguments)); },
    debug: function() { write('debug', Array.prototype.slice.call(arguments)); },
    warn: function() { write('warn', Array.prototype.slice.call(arguments)); },
    error: function() { write('error', Array.prototype.slice.call(arguments)); },
};

const allowList = payload.requireAllowList || [];
const rawRequire = require;
function safeRequire(name) {
    if (allowList.indexOf(name) >= 0) {
        return rawRequire(name);
    }
    throw new Error('模块 "' + name + '" 不在允许引入的白名单中');
}

let modules = {};
try {
    modules.moment = rawRequire('moment');
    modules.path = rawRequire('path');
    modules.axios = rawRequire('axios');
} catch (e) {
    // 依赖缺失时降级，不影响任务本身
}

async function request(url, data, option) {
    const opt = Object.assign({ url: url, data: data, method: 'post', timeout: 30000 }, option || {});
    const res = await modules.axios.request(opt);
    return res && res.data;
}

function sleep(time) {
    const ms = time === undefined ? 10 : time;
    return new Promise(function(resolve) { setTimeout(resolve, ms); });
}

const task = payload.task || {};

(async function() {
    try {
        const code = fs.readFileSync(scriptPath, 'utf8');
        const AsyncFunction = Object.getPrototypeOf(async function() {}).constructor;
        const fn = new AsyncFunction(
            'console', 'request', 'sleep', 'task', 'modules', 'require', 'process',
            code
        );
        const res = await fn(
            vconsole, request, sleep, task, modules, safeRequire, null
        );
        if (res !== undefined) {
            write('info', [serialize(res)]);
        }
        process.exit(0);
    } catch (e) {
        write('error', [e && e.stack ? e.stack : String(e)]);
        process.exit(1);
    }
})();
`;

/**
 * 判断执行器是否为「子进程隔离」模式
 */
export function isIsolatedExec(execType: TaskExecType): boolean {
    return execType !== TaskExecType.js;
}

/**
 * 解析执行器对应的命令
 */
function resolveCommand(
    execType: TaskExecType,
    task: any,
    scriptFile: string
): { cmd: string; args: string[] } {
    const command = String(task?.execCommand || '').trim();
    switch (execType) {
        case TaskExecType.node:
            return { cmd: process.execPath, args: [scriptFile] };
        case TaskExecType.shell:
            return { cmd: 'bash', args: [command || scriptFile] };
        case TaskExecType.python:
            return { cmd: 'python3', args: [command || scriptFile] };
        case TaskExecType.command:
        default:
            // 交给 shell 解释，支持管道等复杂命令行
            return { cmd: command, args: [] };
    }
}

/**
 * 以子进程方式执行任务：真实超时可中断、崩溃隔离
 */
async function execByChildProcess(options: ExecOptions): Promise<ExecResult> {
    const start = Date.now();
    const collector = new LogCollector();
    const { task, instance, timeout, workRoot } = options;

    const execType = Number(task?.execType ?? TaskExecType.js) as TaskExecType;
    const dir = path.join(workRoot, String(instance?.id || 0));
    try {
        fs.mkdirSync(dir, { recursive: true });
    } catch (e) {
        return {
            status: 'failed',
            exitCode: -1,
            message: `创建工作目录失败: ${(e as Error).message}`,
            duration: Date.now() - start,
            log: collector.content,
        };
    }

    const scriptFile = path.join(dir, 'script.js');
    try {
        fs.writeFileSync(scriptFile, String(task?.script || ''), 'utf8');
    } catch (e) {
        return {
            status: 'failed',
            exitCode: -1,
            message: `写入脚本失败: ${(e as Error).message}`,
            duration: Date.now() - start,
            log: collector.content,
        };
    }

    const payloadFile = path.join(dir, 'payload.json');
    try {
        fs.writeFileSync(
            payloadFile,
            JSON.stringify({
                task: {
                    id: task?.id,
                    name: task?.name,
                    description: task?.description,
                    timeSize: task?.timeSize,
                    timeValue: task?.timeValue,
                },
                requireAllowList: options.requireAllowList || [],
            }),
            'utf8'
        );
    } catch (e) {
        return {
            status: 'failed',
            exitCode: -1,
            message: `写入上下文失败: ${e}`,
            duration: Date.now() - start,
            log: collector.content,
        };
    }

    let cmd = '';
    let args: string[] = [];
    if (execType === TaskExecType.node) {
        // node 模式走引导脚本，把用户脚本作为参数传入
        const bootstrapFile = path.join(dir, 'bootstrap.js');
        fs.writeFileSync(bootstrapFile, BOOTSTRAP_TEMPLATE, 'utf8');
        cmd = process.execPath;
        args = [bootstrapFile, scriptFile, payloadFile];
    } else {
        const resolved = resolveCommand(execType, task, scriptFile);
        cmd = resolved.cmd;
        args = resolved.args;
    }

    if (!cmd) {
        return {
            status: 'failed',
            exitCode: -1,
            message: '未配置执行命令',
            duration: Date.now() - start,
            log: collector.content,
        };
    }

    const env: Record<string, string> = {
        ...(process.env as any),
        ...(options.env || {}),
        TASK_ID: String(task?.id || ''),
        TASK_NAME: String(task?.name || ''),
        INSTANCE_ID: String(instance?.id || ''),
    };

    const cwd =
        task?.workDir && fs.existsSync(task.workDir) ? task.workDir : workRoot;

    return await new Promise<ExecResult>(resolve => {
        let child: any;
        let timedOut = false;
        let settled = false;

        const done = (result: ExecResult) => {
            if (settled) return;
            settled = true;
            resolve(result);
        };

        try {
            child = spawn(cmd, args, {
                cwd,
                env,
                shell: execType === TaskExecType.command,
                // 独立进程组，便于超时后连同子孙进程一起回收
                detached: process.platform !== 'win32',
                stdio: ['ignore', 'pipe', 'pipe'],
            });
        } catch (e) {
            done({
                status: 'failed',
                exitCode: -1,
                message: `启动子进程失败: ${(e as Error).message}`,
                duration: Date.now() - start,
                log: collector.content,
            });
            return;
        }

        // 记录子进程 pid，便于外部超时回收
        if (child.pid) {
            try {
                options.onSpawn?.(child.pid);
            } catch (e) {
                // 忽略回调异常
            }
        }

        // 超时强杀
        let timer: any = null;
        if (timeout > 0) {
            timer = setTimeout(() => {
                timedOut = true;
                collector.append(
                    'error',
                    `任务执行超过 ${timeout} 秒，正在强制终止`
                );
                try {
                    if (process.platform !== 'win32' && child.pid) {
                        // 杀掉整个进程组，避免遗留孙进程
                        process.kill(-child.pid, 'SIGKILL');
                    } else {
                        child.kill('SIGKILL');
                    }
                } catch (e) {
                    try {
                        child.kill('SIGKILL');
                    } catch (e2) {
                        /* ignore */
                    }
                }
            }, timeout * 1000);
        }

        if (child.stdout) {
            child.stdout.on('data', (buf: Buffer) => {
                const text = buf.toString('utf8');
                for (const line of text.split('\n')) {
                    if (line.trim()) collector.append('info', line);
                }
            });
        }
        if (child.stderr) {
            child.stderr.on('data', (buf: Buffer) => {
                const text = buf.toString('utf8');
                for (const line of text.split('\n')) {
                    if (line.trim()) collector.append('error', line);
                }
            });
        }

        child.on('error', (err: Error) => {
            if (timer) clearTimeout(timer);
            done({
                status: 'failed',
                exitCode: -1,
                message: `子进程异常: ${err.message}`,
                duration: Date.now() - start,
                log: collector.content,
            });
        });

        child.on('close', (code: number, signal: string) => {
            if (timer) clearTimeout(timer);
            const duration = Date.now() - start;
            if (timedOut) {
                done({
                    status: 'timeout',
                    exitCode: code === null ? -1 : code,
                    message: `任务执行超时（${timeout}秒），已终止进程`,
                    duration,
                    log: collector.content,
                });
                return;
            }
            if (code === 0) {
                done({
                    status: 'success',
                    exitCode: 0,
                    message: '',
                    duration,
                    log: collector.content,
                });
            } else {
                done({
                    status: 'failed',
                    exitCode: code === null ? (signal ? -1 : 0) : code,
                    message: `进程退出码 ${code}${
                        signal ? ' (信号 ' + signal + ')' : ''
                    }`,
                    duration,
                    log: collector.content,
                });
            }
        });
    });
}

/**
 * 以主进程内联方式执行（兼容历史任务）
 *
 * 注意：内联模式运行在服务主线程，无法真正中断正在执行的脚本。
 * 超时后仅标记状态并释放调度额度，脚本可能继续占用资源。
 * 生产环境建议使用 node / shell / python 等隔离执行器。
 */
async function execInline(options: ExecOptions): Promise<ExecResult> {
    const start = Date.now();
    const collector = new LogCollector();
    const { task, timeout } = options;

    const vconsole = createVConsole(collector);

    const execParams = {
        console: vconsole,
        require: () => {
            throw Error('内联执行模式不支持require，请改用子进程执行器');
        },
        process: null,
        task: {
            id: task?.id,
            name: task?.name,
            description: task?.description,
            timeSize: task?.timeSize,
            timeValue: task?.timeValue,
        },
        request: async (url: string, data?: any, option?: any) => {
            const res = await axios.request({
                url,
                data,
                method: 'post',
                timeout: 30000,
                ...(option || {}),
            });
            return res?.data;
        },
        sleep: async (time = 10) => {
            return new Promise<void>(resolve => {
                setTimeout(() => resolve(), time);
            });
        },
        modules: {
            moment,
            path,
            axios,
        },
    };

    collector.append('info', `开始执行：${task?.name || ''}`);

    let timer: any = null;
    const timeoutPromise = new Promise<'timeout'>(resolve => {
        if (timeout > 0) {
            timer = setTimeout(() => resolve('timeout'), timeout * 1000);
        }
    });

    try {
        const execPromise = jsruntime.runScript(String(task?.script || ''), {
            promise: true,
            params: execParams,
        }) as Promise<any>;

        const result = await Promise.race([execPromise, timeoutPromise]);

        if (result === 'timeout') {
            collector.append(
                'error',
                `任务执行超过 ${timeout} 秒，已标记为超时（内联模式无法强制中断脚本）`
            );
            return {
                status: 'timeout',
                exitCode: -1,
                message: `任务执行超时（${timeout}秒），内联模式无法强制中断脚本`,
                duration: Date.now() - start,
                log: collector.content,
            };
        }

        collector.append(
            'info',
            result === undefined
                ? '执行结束'
                : `执行结束：${serializeArg(result)}`
        );
        return {
            status: 'success',
            exitCode: 0,
            message: '',
            duration: Date.now() - start,
            log: collector.content,
        };
    } catch (e) {
        collector.append('error', (e as Error)?.stack || String(e));
        return {
            status: 'failed',
            exitCode: -1,
            message: (e as Error)?.message || String(e),
            duration: Date.now() - start,
            log: collector.content,
        };
    } finally {
        if (timer) clearTimeout(timer);
    }
}

/**
 * 统一执行入口：按执行器类型选择内联或子进程模式
 */
export async function executeTask(options: ExecOptions): Promise<ExecResult> {
    const execType = Number(
        options.task?.execType ?? TaskExecType.js
    ) as TaskExecType;
    if (isIsolatedExec(execType)) {
        return await execByChildProcess(options);
    }
    return await execInline(options);
}

/**
 * 清理实例的临时工作目录
 */
export function cleanupExecDir(workRoot: string, instanceId: number) {
    try {
        const dir = path.join(workRoot, String(instanceId));
        if (fs.existsSync(dir)) {
            fs.rmSync(dir, { recursive: true, force: true });
        }
    } catch (e) {
        // 清理失败不影响主流程
    }
}
