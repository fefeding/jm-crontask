import * as path from 'path';
import * as fs from 'fs';
import { executeTask, cleanupExecDir } from '../executor';
import { TaskExecType } from '../../model/taskConst';

const workRoot = path.join(process.cwd(), 'data', 'test-exec');

function baseTask(overrides: any = {}) {
    return {
        id: 1,
        name: '测试任务',
        description: '',
        script: '',
        timeSize: 1,
        timeValue: '1',
        execType: TaskExecType.js,
        execCommand: '',
        workDir: '',
        envJson: '',
        ...overrides,
    };
}

describe('任务执行器 executeTask', () => {
    afterAll(() => {
        try {
            fs.rmSync(workRoot, { recursive: true, force: true });
        } catch (e) {
            // 忽略清理失败
        }
    });

    describe('内联模式', () => {
        it('脚本正常返回时执行成功', async () => {
            const res = await executeTask({
                task: baseTask({ script: 'return 1 + 1;' }),
                instance: { id: 9001 },
                timeout: 10,
                workRoot,
            });
            expect(res.status).toBe('success');
            expect(res.exitCode).toBe(0);
            expect(res.log).toContain('2');
        });

        it('脚本抛异常时执行失败并记录日志', async () => {
            const res = await executeTask({
                task: baseTask({ script: 'throw new Error("boom");' }),
                instance: { id: 9002 },
                timeout: 10,
                workRoot,
            });
            expect(res.status).toBe('failed');
            expect(res.log).toContain('boom');
        });

        it('console 输出被完整采集', async () => {
            const res = await executeTask({
                task: baseTask({ script: 'console.info("hello world");' }),
                instance: { id: 9003 },
                timeout: 10,
                workRoot,
            });
            expect(res.status).toBe('success');
            expect(res.log).toContain('hello world');
        });
    });

    describe('子进程隔离模式', () => {
        it('子进程执行成功并回传 stdout', async () => {
            const res = await executeTask({
                task: baseTask({
                    execType: TaskExecType.node,
                    script: 'console.info("from child process");',
                }),
                instance: { id: 9101 },
                timeout: 15,
                workRoot,
            });
            expect(res.status).toBe('success');
            expect(res.log).toContain('from child process');
        });

        it('子进程异常退出时返回失败与退出码', async () => {
            const res = await executeTask({
                task: baseTask({
                    execType: TaskExecType.node,
                    script: 'throw new Error("child failed");',
                }),
                instance: { id: 9102 },
                timeout: 15,
                workRoot,
            });
            expect(res.status).toBe('failed');
            expect(res.exitCode).toBe(1);
            expect(res.log).toContain('child failed');
        });

        it('超时后强制终止子进程并返回 timeout（此前内联模式无法中断）', async () => {
            const res = await executeTask({
                task: baseTask({
                    execType: TaskExecType.node,
                    script: 'await sleep(60000);',
                }),
                instance: { id: 9103 },
                timeout: 1,
                workRoot,
            });
            expect(res.status).toBe('timeout');
            expect(res.log).toContain('强制终止');
        });

        it('通过 onSpawn 回调回传子进程 pid', async () => {
            let pid = 0;
            await executeTask({
                task: baseTask({
                    execType: TaskExecType.node,
                    script: 'console.info("pid test");',
                }),
                instance: { id: 9104 },
                timeout: 15,
                workRoot,
                onSpawn: (p: number) => {
                    pid = p;
                },
            });
            expect(pid).toBeGreaterThan(0);
        });

        it('外部命令执行器可直接运行 shell 命令', async () => {
            const res = await executeTask({
                task: baseTask({
                    execType: TaskExecType.command,
                    execCommand: 'echo command-ok',
                }),
                instance: { id: 9105 },
                timeout: 15,
                workRoot,
            });
            expect(res.status).toBe('success');
            expect(res.log).toContain('command-ok');
        });
    });

    describe('临时目录清理', () => {
        it('清理后目录不存在', async () => {
            await executeTask({
                task: baseTask({ script: 'return 1;' }),
                instance: { id: 9201 },
                timeout: 10,
                workRoot,
            });
            const dir = path.join(workRoot, '9201');
            cleanupExecDir(workRoot, 9201);
            expect(fs.existsSync(dir)).toBe(false);
        });
    });
});
