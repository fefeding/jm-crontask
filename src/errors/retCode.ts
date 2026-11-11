/**
 * @file 响应码约定
 * @description 前后端共用的业务/系统响应码，避免魔法数字散落在各处。
 * @author fefeding
 *
 * 约定：
 * - ret === 0：成功；
 * - ret === RET_BIZ_ERROR(1)：预期内的业务失败（参数非法、无权限、资源不存在等）；
 * - ret === RET_SYSTEM_ERROR(1000)：未分类的系统异常（兜底，由全局异常过滤器统一返回）；
 * - ret >= 50000：账号服务 / 全局 AuthGuard 产生的登录态相关错误码。
 *
 * 前端对应常量见 web/src/base/retCode.ts，两侧需保持一致。
 */

/** 成功 */
export const RET_OK = 0;

/** 预期内的业务失败，由 BizError 抛出 */
export const RET_BIZ_ERROR = 1;

/** 未分类的系统异常（兜底） */
export const RET_SYSTEM_ERROR = 1000;

/** 登录态失效，需要重新登录 */
export const RET_AUTH_EXPIRED = 50001;

/** 需要登录态（未登录或会话已过期） */
export const RET_NEED_LOGIN = 50003;
