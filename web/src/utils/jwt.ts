/**
 * @file JWT 载荷解析
 * @description 解析服务端签发的 JWT，取出其中的会话载荷。
 *
 *              后端本地校验模式下，`POST /api/session/loginByAccount` 返回的是
 *              **token 字符串**（形如 `Bearer xxx.yyy.zzz`），而非会话对象：
 *
 *                  const session = { lastDate, id, loginId, user, account, userId };
 *                  const token = 'Bearer ' + utils.encodeJWT(session, secretKey);
 *
 *              若把该字符串直接塞进会话 store（Object.assign 会把字符串按字符下标
 *              摊平成一堆 0/1/2 键），会话里就没有 id / userId，
 *              isLoggedIn 恒为 false —— 表现就是「登录成功却仍被判定未登录」。
 *              故此处把 token 载荷解出来，还原成真正的会话对象。
 *
 *              注意：这里只做**解码**，不校验签名。签名校验由服务端完成，
 *              前端解出的载荷仅用于界面展示与登录态判断。
 * @author fefeding
 */

/**
 * 解析 JWT 载荷（不校验签名）
 *
 * @param token 服务端返回的 token，允许带 `Bearer ` 前缀
 * @returns 载荷对象；无法解析时返回 null
 */
export function decodeJwtPayload(token?: string | null): Record<string, any> | null {
    if (!token) return null;

    const raw = String(token).replace(/^Bearer\s+/i, '').trim();
    const parts = raw.split('.');
    const payloadPart = parts[1];
    if (!payloadPart) return null;

    try {
        // base64url → base64
        const b64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
        const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
        const binary = atob(padded);
        // 按 UTF-8 还原（载荷里含中文用户名时必需）
        const json = decodeURIComponent(
            Array.from(binary)
                .map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
                .join('')
        );
        const payload = JSON.parse(json);
        return payload && typeof payload === 'object' ? payload : null;
    } catch (e) {
        console.warn('[jwt] 解析 token 载荷失败', e);
        return null;
    }
}
