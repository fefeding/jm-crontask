/**
 * @file 全局异常过滤器
 * @description 捕获所有未处理的异常，记录完整错误日志并统一返回错误响应
 * @author fefeding
 *
 * 返回格式：{ ret: 1000, msg: 错误信息 }
 */
import { Catch } from '@midwayjs/core';
import { koa, RedirectError } from '@cicctencent/midwayjs-base';
import { RET_SYSTEM_ERROR } from '../errors/retCode';

/**
 * 默认异常过滤器
 * @class DefaultErrorFilter
 * @catch 所有异常
 */
@Catch()
export class DefaultErrorFilter {
    async catch(
        err: Error & {
            ret?: number;
            msg?: string;
            location?: string;
            status?: number;
        },
        ctx: koa.Context
    ) {
        // 认证重定向：AuthGuard 在未登录且非 API 路由时抛出 RedirectError，
        // 需执行 302 跳转至登录页。不可作为错误记录日志，也不能透传为 JSON 错误。
        if (err instanceof RedirectError) {
            ctx.status = err.status || 302;
            ctx.redirect(err.location);
            return;
        }

        // 记录完整错误信息，便于排查问题
        const isBizError =
            err.name === 'BizError' || typeof err.ret === 'number';
        ctx.logger?.error('Unhandled error caught by DefaultErrorFilter', {
            name: err.name,
            message: err.message,
            stack: err.stack,
            url: ctx?.url,
            method: ctx?.method,
            requestBody: ctx?.request?.body,
            ret: err.ret,
            msg: err.msg,
            isBizError,
        });

        // BizError（如鉴权失败、参数错误等）保留原始错误码，避免被统一覆盖为系统异常码
        if (isBizError) {
            return {
                ret: err.ret ?? RET_SYSTEM_ERROR,
                msg: err.msg || err.message,
            };
        }

        // 所有的未分类错误会到这里
        return {
            ret: RET_SYSTEM_ERROR,
            msg: err.message,
        };
    }
}
