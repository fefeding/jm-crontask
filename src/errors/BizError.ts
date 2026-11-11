/**
 * @file 业务异常
 * @description 携带固定业务错误码，交由 DefaultErrorFilter 透传为响应 ret/msg。
 * 与普通 Error（→ ret:1000 系统异常，会被记录完整日志）区分，便于前端与日志识别。
 * @author fefeding
 */
import { RET_BIZ_ERROR } from './retCode';

export class BizError extends Error {
    /** 业务错误码（透传为响应 ret） */
    public ret: number;
    /** 业务错误信息（透传为响应 msg） */
    public msg: string;

    /**
     * @param msg 错误信息
     * @param ret 业务错误码，默认 RET_BIZ_ERROR(1)；仅当需要区分不同业务码时传入
     */
    constructor(msg: string, ret: number = RET_BIZ_ERROR) {
        super(msg);
        this.name = 'BizError';
        this.ret = ret;
        this.msg = msg;
    }
}
