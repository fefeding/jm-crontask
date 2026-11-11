/**
 * @file 登录态策略纯函数
 * @description 管理端 SPA 的登录态判定与守卫动作决策。
 *
 *              设计约束：零运行时依赖——不引用 DOM、浏览器全局、别名路径或框架，
 *              以便可被单元测试直接引用。
 *
 *              背景：后端渲染首页时会把会话快照注入 `window.__INITIAL_STATE__.session`
 *              （即请求上下文里的 currentSession，由全局 AuthGuard 在请求携带有效
 *              认证 cookie 时解码写入；无有效 cookie 时为 null）。
 *              该注入值是「本次页面加载那一刻」的登录态权威快照。
 * @author fefeding
 */

/** 会话最小结构：含有效 id 即视为已登录 */
export interface SessionLike {
    id?: string | number;
}

/**
 * 登录态来源判定结果
 * - `server`：服务端注入了含 id 的会话，采信服务端
 * - `none`：服务端明确未登录（null / 空对象 / 无 id），本地残留不可采信
 * - `local`：服务端未提供该信号（undefined），回退使用本地持久化会话
 */
export type SessionSource = 'server' | 'none' | 'local';

/** 守卫动作：放行 / 跳转登录入口 */
export type GuardAction = 'allow' | 'login';

/** 登录态来源判定结果 */
export interface SessionResolution<T extends SessionLike = SessionLike> {
    source: SessionSource;
    /** 判定为 server / local 时携带会话；none 时不携带 */
    session?: T;
}

/**
 * 判定登录态来源：服务端注入优先。
 *
 * 这是「登录成功却被打回登录页」的第一道防线：
 * 本地 sessionStorage 里的会话可能已过期（认证 cookie 失效后仍残留），
 * 若让它盖过服务端注入的快照，就会出现
 * 「服务端明明已登录，前端却认为未登录」→ 反复跳登录页。
 *
 * @param server 服务端注入的会话（可能为 undefined / null / 空对象）
 * @param local 本地持久化会话
 * @returns 判定来源及对应会话
 */
export function resolveSessionSource<T extends SessionLike>(
    server: T | null | undefined,
    local?: T | null
): SessionResolution<T> {
    // 服务端未提供该信号：无法据其判断，回退本地
    if (server === undefined) {
        return { source: 'local', session: local ?? undefined };
    }
    // 服务端提供了含有效 id 的会话：已登录，采信服务端
    if (server && server.id) {
        return { source: 'server', session: server };
    }
    // 服务端明确未登录（null / 空对象 / 无 id）：忽略本地残留
    return { source: 'none' };
}

/**
 * 判定路由守卫动作。
 *
 * @param loggedIn 是否已登录
 * @returns `allow` 放行；`login` 跳转登录入口
 */
export function decideGuardAction(loggedIn: boolean): GuardAction {
    return loggedIn ? 'allow' : 'login';
}

/**
 * 会话校准决策
 * - `use-server`：采信服务端快照（首屏即已登录）
 * - `use-runtime`：采信运行期会话（服务端未提供快照信号，但运行期已登录）
 * - `verify-server`：快照与运行期矛盾，双方都不能直接采信，需向后端权威接口核实
 * - `clear`：明确未登录，清理本地残留
 */
export type SessionDecision =
    | 'use-server'
    | 'use-runtime'
    | 'verify-server'
    | 'clear';

/** 会话校准决策的输入 */
export interface SessionDecisionInput {
    /** 服务端注入快照（页面加载那一刻的登录态；undefined 表示服务端未提供该信号） */
    snapshot?: SessionLike | null;
    /** 运行期是否已登录 */
    runtimeLoggedIn?: boolean;
}

/**
 * 决定本次登录态校准该采取的动作。
 *
 * 背景：`sysConfig.session` 是**页面加载时的服务端快照**，SPA 生命周期内不变。
 * 若把它当作唯一权威判据，就会出现「旧记录覆盖新状态」：
 * 打开页面时未登录（快照为 null）→ 本次页面生命周期内登录成功（运行期已登录）
 * → 路由切换时按旧快照判定未登录 → 清掉运行期会话 → 用户被反复踢回登录页。
 *
 * 故此处显式区分四种情形：快照有效则采信；快照缺失则回退运行期；
 * 快照明确未登录而运行期已登录（矛盾）时**不盲清**，转权威核实；
 * 两者都未登录才清理残留。
 *
 * @param input 快照与运行期登录态
 * @returns 校准动作
 */
export function decideSessionDecision(
    input: SessionDecisionInput
): SessionDecision {
    const { snapshot, runtimeLoggedIn } = input;
    // 快照含有效 id：服务端明确已登录，采信服务端
    if (snapshot && snapshot.id) return 'use-server';
    // 快照未提供该信号（undefined）：无法据其判断，回退运行期
    if (snapshot === undefined) {
        return runtimeLoggedIn ? 'use-runtime' : 'clear';
    }
    // 快照明确未登录（null / 空对象 / 无 id）：
    // 运行期已登录说明「本次页面生命周期内刚登录成功」，快照已陈旧，
    // 直接清除正是把已登录用户踢回登录页的根因 → 转后端权威核实。
    return runtimeLoggedIn ? 'verify-server' : 'clear';
}
