import { Provide, Scope, ScopeEnum, Config, Inject } from '@midwayjs/core';
import { BaseService } from '@cicctencent/midwayjs-base';
import * as path from 'path';
import * as fs from 'fs';
import InstanceService from './taskInstance';

export interface MaintainConfig {
    /** 是否启用维护任务 */
    enabled?: boolean;
    /** 实例记录保留天数，0 表示不清理 */
    instanceRetentionDays?: number;
    /** 日志文件保留天数，0 表示不清理 */
    logRetentionDays?: number;
    /** 产物备份保留天数，0 表示不清理 */
    publishRetentionDays?: number;
    /** 维护周期（毫秒） */
    interval?: number;
}

/**
 * 维护服务：负责实例记录、日志文件、产物备份的归档清理
 *
 * 此前实例表与日志文件会无限增长，这里提供周期性的归档策略。
 */
@Provide()
@Scope(ScopeEnum.Singleton)
export default class MaintainService extends BaseService {
    @Config('maintain')
    maintainConfig: MaintainConfig;

    @Inject()
    instanceService: InstanceService;

    private get logger(): any {
        try {
            return this.ctx?.log || this.app?.getLogger?.() || console;
        } catch (e) {
            return console;
        }
    }

    /** 数据根目录 */
    private get dataRoot(): string {
        return process.env.TASK_DATA_ROOT || path.join(process.cwd(), 'data');
    }

    /**
     * 执行一次维护
     */
    async run() {
        const cfg = this.maintainConfig || {};
        if (cfg.enabled === false) return;

        const now = Date.now();
        try {
            await this.clearInstances(now, cfg.instanceRetentionDays);
            await this.clearLogs(now, cfg.logRetentionDays);
            await this.clearPublish(now, cfg.publishRetentionDays);
            await this.clearExecTmp();
        } catch (e) {
            this.logger.error?.('维护任务异常:', e);
        }
    }

    /**
     * 清理历史实例记录
     */
    private async clearInstances(now: number, retentionDays?: number) {
        const days = Number(retentionDays ?? 30);
        if (days <= 0) return;
        const endTime = new Date(now - days * 24 * 3600 * 1000);
        const res = await this.instanceService.clear(endTime);
        this.logger.info?.(
            `维护任务：已清理 ${days} 天前的实例记录 ${res?.affected ?? 0} 条`
        );
    }

    /**
     * 清理历史日志文件
     */
    private async clearLogs(now: number, retentionDays?: number) {
        const days = Number(retentionDays ?? 30);
        if (days <= 0) return;
        const root = path.join(this.dataRoot, 'logs', 'tasks');
        const count = this.clearDirByTime(root, now - days * 24 * 3600 * 1000);
        if (count > 0) {
            this.logger.info?.(
                `维护任务：已清理 ${days} 天前的日志文件 ${count} 个`
            );
        }
    }

    /**
     * 清理历史产物备份
     */
    private async clearPublish(now: number, retentionDays?: number) {
        const days = Number(retentionDays ?? 30);
        if (days <= 0) return;
        const root = path.join(this.dataRoot, 'publish');
        const count = this.clearDirByTime(root, now - days * 24 * 3600 * 1000);
        if (count > 0) {
            this.logger.info?.(
                `维护任务：已清理 ${days} 天前的产物备份 ${count} 个`
            );
        }
    }
    /**
     * 清理残留的临时执行目录
     */
    private async clearExecTmp() {
        const root = path.join(this.dataRoot, 'exec');
        if (!fs.existsSync(root)) return;
        try {
            const entries = fs.readdirSync(root);
            for (const entry of entries) {
                const dir = path.join(root, entry);
                try {
                    const stat = fs.statSync(dir);
                    // 超过 1 天的临时目录视为残留
                    if (Date.now() - stat.mtimeMs > 24 * 3600 * 1000) {
                        fs.rmSync(dir, { recursive: true, force: true });
                    }
                } catch (e) {
                    // 忽略单个目录的清理失败
                }
            }
        } catch (e) {
            // 忽略
        }
    }

    /**
     * 递归删除目录下超过指定时间的文件
     */
    private clearDirByTime(root: string, beforeTime: number): number {
        if (!fs.existsSync(root)) return 0;
        let count = 0;
        try {
            const walk = (dir: string) => {
                for (const entry of fs.readdirSync(dir)) {
                    const full = path.join(dir, entry);
                    let stat: fs.Stats;
                    try {
                        stat = fs.statSync(full);
                    } catch (e) {
                        continue;
                    }
                    if (stat.isDirectory()) {
                        walk(full);
                        // 空目录一并清理
                        try {
                            if (fs.readdirSync(full).length === 0)
                                fs.rmdirSync(full);
                        } catch (e) {
                            // 忽略
                        }
                    } else if (stat.mtimeMs < beforeTime) {
                        try {
                            fs.unlinkSync(full);
                            count++;
                        } catch (e) {
                            // 忽略单个文件清理失败
                        }
                    }
                }
            };
            walk(root);
        } catch (e) {
            this.logger.warn?.('清理目录失败:', e);
        }
        return count;
    }
}
