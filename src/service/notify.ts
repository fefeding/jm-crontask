import { Provide, Scope, ScopeEnum, Config } from '@midwayjs/core';
import { BaseService } from '@cicctencent/midwayjs-base';
import axios from 'axios';
import { EventEmitter } from 'events';
import { AlertType, NotifyChannelType } from '../model/taskConst';

export interface NotifyChannelConfig {
    /** 通道类型 */
    type: NotifyChannelType | string;
    /** 是否启用 */
    enabled?: boolean;
    /** 通道地址（webhook / wecom 必填） */
    url?: string;
    /** 自定义请求头 */
    headers?: Record<string, string>;
    /** 超时（毫秒） */
    timeout?: number;
    /** 日志级别（log 通道使用） */
    level?: string;
    /** 签名密钥（钉钉/企业微信自定义机器人加签使用） */
    secret?: string;
}

export interface NotifyConfig {
    /** 通知通道列表 */
    channels?: NotifyChannelConfig[];
    /** 全局接收人（staffid），任务未配置关注人时使用 */
    receivers?: string[];
    /** 告警规则 */
    rules?: {
        notifyOnFailure?: boolean;
        notifyOnTimeout?: boolean;
        consecutiveFailureThreshold?: number;
        notifyOnRecover?: boolean;
        notifyOnMissed?: boolean;
        notifyOnInvalidConfig?: boolean;
    };
}

export interface AlertPayload {
    /** 告警类型 */
    type: AlertType | string;
    /** 标题 */
    title: string;
    /** 内容 */
    content: string;
    /** 关联任务 */
    taskId?: number;
    /** 任务名称 */
    taskName?: string;
    /** 关联实例 */
    instanceId?: number;
    /** 接收人 */
    receivers?: string[];
    /** 附加信息 */
    extra?: Record<string, any>;
    /** 发生时间 */
    time?: string;
}

/**
 * 通知服务：多通道告警 + 事件钩子
 *
 * 设计要点：
 * 1. 通道可插拔（log / console / webhook / 企业微信机器人），配置化启用
 * 2. 任意通道发送失败都不影响其它通道，也不影响任务本身
 * 3. 对外提供事件钩子，业务方可监听 alert 事件自行扩展告警渠道
 */
@Provide()
@Scope(ScopeEnum.Singleton)
export default class NotifyService extends BaseService {
    @Config('notify')
    notifyConfig: NotifyConfig;

    /** 事件总线，业务方可监听扩展 */
    private emitter = new EventEmitter();

    /**
     * 监听告警事件
     */
    on(event: string, listener: (...args: any[]) => void) {
        this.emitter.on(event, listener);
        return this;
    }

    off(event: string, listener: (...args: any[]) => void) {
        this.emitter.removeListener(event, listener);
        return this;
    }

    private get logger(): any {
        try {
            return this.ctx?.log || this.app?.getLogger?.() || console;
        } catch (e) {
            return console;
        }
    }

    private get rules() {
        return this.notifyConfig?.rules || {};
    }

    /**
     * 发送告警
     */
    async send(alert: AlertPayload) {
        const payload: AlertPayload = {
            ...alert,
            time: alert.time || new Date().toLocaleString('zh-CN'),
        };

        // 触发事件钩子（外部可监听扩展）
        try {
            this.emitter.emit('alert', payload);
            this.emitter.emit(String(payload.type), payload);
        } catch (e) {
            this.logger.error?.('通知事件钩子执行失败:', e);
        }

        const channels = this.notifyConfig?.channels || [];
        const enabled = channels.filter(c => c.enabled !== false && c.type);

        if (!enabled.length) {
            this.logger.warn?.(
                `[告警] 未配置可用通知通道，告警内容：${payload.title} - ${payload.content}`
            );
            return;
        }

        for (const channel of enabled) {
            try {
                await this.sendByChannel(channel, payload);
            } catch (e) {
                // 单通道失败不影响其它通道
                this.logger.error?.(`[告警] 通道 ${channel.type} 发送失败:`, e);
            }
        }
    }

    /**
     * 按通道发送
     */
    private async sendByChannel(
        channel: NotifyChannelConfig,
        payload: AlertPayload
    ) {
        switch (channel.type) {
            case NotifyChannelType.log: {
                const text = `[告警][${payload.type}] ${payload.title} - ${payload.content}`;
                if (channel.level === 'warn') this.logger.warn?.(text);
                else this.logger.error?.(text);
                break;
            }
            case NotifyChannelType.console: {
                console.log(
                    `[告警][${payload.type}] ${payload.title} - ${payload.content}`
                );
                break;
            }
            case NotifyChannelType.webhook: {
                if (!channel.url) throw new Error('webhook 通道未配置地址');
                await axios.post(
                    channel.url,
                    {
                        type: payload.type,
                        title: payload.title,
                        content: payload.content,
                        taskId: payload.taskId,
                        taskName: payload.taskName,
                        instanceId: payload.instanceId,
                        receivers: payload.receivers,
                        extra: payload.extra,
                        time: payload.time,
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            ...(channel.headers || {}),
                        },
                        timeout: channel.timeout || 5000,
                    }
                );
                break;
            }
            case NotifyChannelType.wecom: {
                if (!channel.url)
                    throw new Error('企业微信通道未配置机器人地址');
                const text = [
                    `**${payload.title}**`,
                    payload.content,
                    payload.taskId ? `任务ID: ${payload.taskId}` : '',
                    payload.instanceId ? `实例ID: ${payload.instanceId}` : '',
                ]
                    .filter(Boolean)
                    .join('\n> ');
                await axios.post(
                    channel.url,
                    {
                        msgtype: 'markdown',
                        markdown: { content: text },
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            ...(channel.headers || {}),
                        },
                        timeout: channel.timeout || 5000,
                    }
                );
                break;
            }
            case NotifyChannelType.dingtalk: {
                if (!channel.url) throw new Error('钉钉通道未配置机器人地址');
                const content = [
                    `### ${payload.title}`,
                    payload.content,
                    payload.taskId ? `> 任务ID: ${payload.taskId}` : '',
                    payload.instanceId ? `> 实例ID: ${payload.instanceId}` : '',
                    `> 时间: ${payload.time}`,
                ]
                    .filter(Boolean)
                    .join('\n\n');
                const body: Record<string, any> = {
                    msgtype: 'markdown',
                    markdown: { title: payload.title, text: content },
                };
                // 自定义机器人加签：timestamp + secret 做 HmacSHA256 后 base64
                if (channel.secret) {
                    const timestamp = Date.now();
                    const stringToSign = `${timestamp}\n${channel.secret}`;
                    const crypto = require('crypto');
                    const sign = crypto
                        .createHmac('sha256', channel.secret)
                        .update(stringToSign)
                        .digest('base64');
                    body.timestamp = timestamp;
                    body.sign = sign;
                }
                await axios.post(channel.url, body, {
                    headers: {
                        'Content-Type': 'application/json',
                        ...(channel.headers || {}),
                    },
                    timeout: channel.timeout || 5000,
                });
                break;
            }
            default:
                this.logger.warn?.(`[告警] 未知的通知通道：${channel.type}`);
        }
    }

    /**
     * 取接收人：任务关注人优先，其次全局接收人
     */
    private getReceivers(task: any): string[] {
        const watcher = String(task?.watcher || '').trim();
        if (watcher) {
            return watcher
                .split('|')
                .map(v => v.trim())
                .filter(Boolean);
        }
        return this.notifyConfig?.receivers || [];
    }

    /**
     * 任务执行失败
     */
    async taskFailed(task: any, message: string, instanceId?: number) {
        if (this.rules.notifyOnFailure === false) return;
        await this.send({
            type: AlertType.taskFailed,
            title: `任务执行失败：${task?.name || ''}`,
            content: message,
            taskId: task?.id,
            taskName: task?.name,
            instanceId,
            receivers: this.getReceivers(task),
        });
    }

    /**
     * 任务执行超时
     */
    async taskTimeout(task: any, message: string, instanceId?: number) {
        if (this.rules.notifyOnTimeout === false) return;
        await this.send({
            type: AlertType.taskTimeout,
            title: `任务执行超时：${task?.name || ''}`,
            content: message,
            taskId: task?.id,
            taskName: task?.name,
            instanceId,
            receivers: this.getReceivers(task),
        });
    }

    /**
     * 连续失败告警
     */
    async taskConsecutiveFailure(
        task: any,
        count: number,
        instanceId?: number
    ) {
        const threshold = this.rules.consecutiveFailureThreshold ?? 3;
        if (count < threshold) return;
        await this.send({
            type: AlertType.taskConsecutiveFailure,
            title: `任务连续失败：${task?.name || ''}`,
            content: `已连续失败 ${count} 次，请检查任务配置与运行环境`,
            taskId: task?.id,
            taskName: task?.name,
            instanceId,
            receivers: this.getReceivers(task),
            extra: { consecutiveFailures: count },
        });
    }

    /**
     * 任务恢复
     */
    async taskRecovered(task: any, instanceId?: number) {
        if (this.rules.notifyOnRecover === false) return;
        await this.send({
            type: AlertType.taskRecovered,
            title: `任务已恢复：${task?.name || ''}`,
            content: '此前连续失败的任务已重新执行成功',
            taskId: task?.id,
            taskName: task?.name,
            instanceId,
            receivers: this.getReceivers(task),
        });
    }

    /**
     * 任务漏跑
     */
    async taskMissed(task: any, missed: number) {
        if (this.rules.notifyOnMissed === false) return;
        await this.send({
            type: AlertType.taskMissed,
            title: `任务漏跑：${task?.name || ''}`,
            content: `检测到漏跑 ${missed} 次，请确认调度器运行状态`,
            taskId: task?.id,
            taskName: task?.name,
            receivers: this.getReceivers(task),
            extra: { missed },
        });
    }

    /**
     * 任务配置非法
     */
    async taskInvalidConfig(task: any, message: string) {
        if (this.rules.notifyOnInvalidConfig === false) return;
        await this.send({
            type: AlertType.taskInvalidConfig,
            title: `任务配置错误：${task?.name || ''}`,
            content: message,
            taskId: task?.id,
            taskName: task?.name,
            receivers: this.getReceivers(task),
        });
    }

    /**
     * 系统级异常
     */
    async systemError(message: string, extra?: Record<string, any>) {
        await this.send({
            type: AlertType.systemError,
            title: '任务调度系统异常',
            content: message,
            receivers: this.notifyConfig?.receivers || [],
            extra,
        });
    }
}
