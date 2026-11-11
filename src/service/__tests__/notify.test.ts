import { EventEmitter } from 'events';
import axios from 'axios';
import NotifyService from '../notify';
import { NotifyChannelType } from '../../model/taskConst';

jest.mock('axios');

const axiosMock = axios as unknown as { post: jest.Mock };

/**
 * 构造一个脱离 Midway 容器运行的 NotifyService 实例
 *
 * 用 Object.create 跳过基类构造（依赖 app/ctx），
 * 只注入测试需要的 notifyConfig 与 emitter。
 */
function createService(channels: any[], rules: any = {}) {
    const svc = Object.create(NotifyService.prototype) as NotifyService;
    (svc as any).notifyConfig = { channels, rules };
    (svc as any).emitter = new EventEmitter();
    return svc;
}

describe('通知服务 NotifyService', () => {
    beforeEach(() => {
        axiosMock.post.mockReset();
        jest.spyOn(console, 'error').mockImplementation(() => undefined);
        jest.spyOn(console, 'warn').mockImplementation(() => undefined);
        jest.spyOn(console, 'log').mockImplementation(() => undefined);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('通道分发', () => {
        it('log 通道写入服务日志', async () => {
            const svc = createService([
                { type: NotifyChannelType.log, enabled: true, level: 'error' },
            ]);
            await svc.taskFailed({ id: 1, name: '测试任务' }, 'boom');
            expect(console.error).toHaveBeenCalled();
            expect(
                String((console.error as jest.Mock).mock.calls[0][0])
            ).toContain('任务执行失败');
        });

        it('webhook 通道以 JSON POST 发送完整告警字段', async () => {
            const svc = createService([
                {
                    type: NotifyChannelType.webhook,
                    enabled: true,
                    url: 'http://hook.local/notify',
                },
            ]);
            await svc.taskFailed({ id: 7, name: '测试任务' }, 'boom', 99);

            expect(axiosMock.post).toHaveBeenCalledTimes(1);
            const [url, body] = axiosMock.post.mock.calls[0];
            expect(url).toBe('http://hook.local/notify');
            expect(body.taskId).toBe(7);
            expect(body.instanceId).toBe(99);
            expect(body.content).toBe('boom');
        });

        it('企业微信通道使用 markdown 消息格式', async () => {
            const svc = createService([
                {
                    type: NotifyChannelType.wecom,
                    enabled: true,
                    url: 'http://wecom.local/robot',
                },
            ]);
            await svc.taskTimeout({ id: 3, name: '超时任务' }, '超时了');

            const [, body] = axiosMock.post.mock.calls[0];
            expect(body.msgtype).toBe('markdown');
            expect(body.markdown.content).toContain('任务执行超时');
        });

        it('钉钉通道未配置 secret 时不带签名', async () => {
            const svc = createService([
                {
                    type: NotifyChannelType.dingtalk,
                    enabled: true,
                    url: 'http://dingtalk.local/robot',
                },
            ]);
            await svc.systemError('系统异常');

            const [, body] = axiosMock.post.mock.calls[0];
            expect(body.msgtype).toBe('markdown');
            expect(body.markdown.text).toContain('系统异常');
            expect(body.sign).toBeUndefined();
            expect(body.timestamp).toBeUndefined();
        });

        it('钉钉通道配置 secret 时生成 timestamp 与 sign', async () => {
            const svc = createService([
                {
                    type: NotifyChannelType.dingtalk,
                    enabled: true,
                    url: 'http://dingtalk.local/robot',
                    secret: 'SECRETxxx',
                },
            ]);
            await svc.systemError('系统异常');

            const [, body] = axiosMock.post.mock.calls[0];
            expect(typeof body.timestamp).toBe('number');
            expect(typeof body.sign).toBe('string');
            expect(body.sign.length).toBeGreaterThan(0);
        });

        it('未配置通道时降级为告警日志，不抛异常', async () => {
            const svc = createService([]);
            await expect(svc.systemError('系统异常')).resolves.toBeUndefined();
            expect(console.warn).toHaveBeenCalled();
            expect(axiosMock.post).not.toHaveBeenCalled();
        });

        it('单个通道发送失败不影响其它通道', async () => {
            axiosMock.post.mockRejectedValueOnce(new Error('network down'));
            const svc = createService([
                {
                    type: NotifyChannelType.webhook,
                    enabled: true,
                    url: 'http://hook.local/notify',
                },
                { type: NotifyChannelType.log, enabled: true },
            ]);
            await expect(svc.systemError('系统异常')).resolves.toBeUndefined();
            // webhook 失败后，log 通道仍应执行
            expect(console.error).toHaveBeenCalled();
        });
    });

    describe('告警规则', () => {
        it('关闭 notifyOnFailure 后不再发送失败告警', async () => {
            const svc = createService(
                [
                    {
                        type: NotifyChannelType.webhook,
                        enabled: true,
                        url: 'http://x',
                    },
                ],
                { notifyOnFailure: false }
            );
            await svc.taskFailed({ id: 1, name: 't' }, 'boom');
            expect(axiosMock.post).not.toHaveBeenCalled();
        });

        it('连续失败次数未达阈值时不告警，达到阈值后告警', async () => {
            const svc = createService(
                [
                    {
                        type: NotifyChannelType.webhook,
                        enabled: true,
                        url: 'http://x',
                    },
                ],
                { consecutiveFailureThreshold: 3 }
            );
            await svc.taskConsecutiveFailure({ id: 1, name: 't' }, 2);
            expect(axiosMock.post).not.toHaveBeenCalled();

            await svc.taskConsecutiveFailure({ id: 1, name: 't' }, 3);
            expect(axiosMock.post).toHaveBeenCalledTimes(1);
        });
    });

    describe('事件钩子与接收人', () => {
        it('对外暴露的 alert 事件可被监听', async () => {
            const svc = createService([]);
            const received: any[] = [];
            svc.on('alert', payload => received.push(payload));
            await svc.systemError('系统异常');
            expect(received).toHaveLength(1);
            expect(received[0].title).toBe('任务调度系统异常');
        });

        it('任务关注人优先于全局接收人', async () => {
            const svc = createService([]);
            (svc as any).notifyConfig.receivers = ['global-staff'];
            const received: any[] = [];
            svc.on('alert', payload => received.push(payload));

            await svc.taskFailed(
                { id: 1, name: 't', watcher: 'alice|bob' },
                'boom'
            );
            expect(received[0].receivers).toEqual(['alice', 'bob']);
        });

        it('任务未配置关注人时回退到全局接收人', async () => {
            const svc = createService([]);
            (svc as any).notifyConfig.receivers = ['global-staff'];
            const received: any[] = [];
            svc.on('alert', payload => received.push(payload));

            await svc.taskFailed({ id: 1, name: 't' }, 'boom');
            expect(received[0].receivers).toEqual(['global-staff']);
        });
    });
});
