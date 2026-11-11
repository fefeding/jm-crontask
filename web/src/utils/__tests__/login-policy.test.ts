import { describe, it, expect } from 'vitest';
import {
    resolveSessionSource,
    decideGuardAction,
    decideSessionDecision,
} from '../login-policy';
import { decodeJwtPayload } from '../jwt';

/** 构造一个已登录的服务端会话 */
function serverSession(id = '49411') {
    return { id, userId: 1, loginId: 'admin' };
}

describe('会话来源判定 resolveSessionSource', () => {
    it('服务端注入了含 id 的会话时采信服务端', () => {
        const res = resolveSessionSource(serverSession() as any, {
            id: 'stale',
            userId: 2,
        } as any);
        expect(res.source).toBe('server');
        expect(res.session?.id).toBe('49411');
    });

    it('服务端明确未登录（null）时忽略本地残留', () => {
        // 这是「登录成功却被踢回登录页」的根因场景：
        // 服务端已注入有效会话，本地 sessionStorage 里的旧会话不能盖过它
        const res = resolveSessionSource(null, { id: 'stale', userId: 2 } as any);
        expect(res.source).toBe('none');
        expect(res.session).toBeUndefined();
    });

    it('服务端注入空对象时同样判定为未登录', () => {
        const res = resolveSessionSource({} as any, { id: 'stale' } as any);
        expect(res.source).toBe('none');
    });

    it('服务端未提供该信号（undefined）时回退本地会话', () => {
        const res = resolveSessionSource(undefined, { id: 'local', userId: 3 } as any);
        expect(res.source).toBe('local');
        expect(res.session?.id).toBe('local');
    });

    it('服务端与本地都没有会话时返回 local 且不带会话', () => {
        const res = resolveSessionSource(undefined, undefined);
        expect(res.source).toBe('local');
        expect(res.session).toBeUndefined();
    });
});

describe('守卫动作 decideGuardAction', () => {
    it('已登录放行，未登录跳登录入口', () => {
        expect(decideGuardAction(true)).toBe('allow');
        expect(decideGuardAction(false)).toBe('login');
    });
});

describe('会话校准决策 decideSessionDecision', () => {
    it('快照有效时采信服务端', () => {
        expect(
            decideSessionDecision({ snapshot: serverSession() as any, runtimeLoggedIn: false })
        ).toBe('use-server');
    });

    it('服务端无信号时回退运行期会话', () => {
        expect(
            decideSessionDecision({ snapshot: undefined, runtimeLoggedIn: true })
        ).toBe('use-runtime');
        expect(
            decideSessionDecision({ snapshot: undefined, runtimeLoggedIn: false })
        ).toBe('clear');
    });

    it('快照明确未登录但运行期已登录时不盲清，转权威核实', () => {
        // 登录后快照仍是旧的 null，若直接 clear 就会把用户踢回登录页
        expect(
            decideSessionDecision({ snapshot: null, runtimeLoggedIn: true })
        ).toBe('verify-server');
    });

    it('快照与运行期都未登录时清理残留', () => {
        expect(
            decideSessionDecision({ snapshot: null, runtimeLoggedIn: false })
        ).toBe('clear');
    });
});

describe('JWT 载荷解析 decodeJwtPayload', () => {
    it('解析 Bearer 前缀的 token', () => {
        const payload = { id: '49411', userId: 1, loginId: 'admin' };
        const b64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
        const token = `Bearer header.${b64}.signature`;
        expect(decodeJwtPayload(token)).toEqual(payload);
    });

    it('无法解析时返回 null', () => {
        expect(decodeJwtPayload('')).toBeNull();
        expect(decodeJwtPayload('not-a-jwt')).toBeNull();
        expect(decodeJwtPayload('a.!!!.c')).toBeNull();
        expect(decodeJwtPayload(undefined)).toBeNull();
    });

    it('正确还原 UTF-8 中文内容', () => {
        const payload = { user: { name: '管理员' } };
        const b64 = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
        expect(decodeJwtPayload(`header.${b64}.sig`)?.user?.name).toBe('管理员');
    });
});
