/**
 * 管理员账号播种初始化器
 *
 * 在「单机 / JSON 回退存储」模式下，基础账号服务不会写入本地 t_user，
 * 导致登录时 getUserByAccount(manager[0]) 报「默认用户不存在」。
 * 本初始化器在启动时按配置 baseService.manager 为管理员账号创建本地用户行，
 * 与存储模式无关（DB / JSON 均走 UserService.model 写入）。
 *
 * - 仅创建不存在的账号，幂等；
 * - 初始密码来自环境变量 DEFAULT_ADMIN_PASSWORD，未配置则为空并告警。
 */
import type { IMidwayContainer } from '@midwayjs/core';
import { MidwayConfigService } from '@midwayjs/core';
import { UserService } from '../service/user.service';

export const userSeedInitializer = {
    name: 'UserSeed',

    async init(container: IMidwayContainer) {
        const configService = await container.getAsync(MidwayConfigService);
        const managerAccounts: string[] =
            configService.getConfiguration('baseService')?.manager || [];

        if (!Array.isArray(managerAccounts) || managerAccounts.length === 0) {
            // 启动期日志：此时还没有请求上下文，用 console 输出
            console.log(
                '[UserSeed][init] 未配置 baseService.manager，跳过管理员播种'
            );
            return;
        }

        const defaultPassword =
            process.env.DEFAULT_ADMIN_PASSWORD?.trim() || undefined;
        const userService = await container.getAsync(UserService);
        await userService.ensureManagerAccountsSeeded(
            managerAccounts,
            defaultPassword
        );
    },
};
