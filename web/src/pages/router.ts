import { createRouter, createWebHistory } from 'vue-router';
import { useTitle } from '@vueuse/core';
import { abortAllPending } from '@/adapter/ajax';
import { initLoginState, redirectToLogin } from '@/service/login';
import { decideGuardAction } from '@/utils/login-policy';
import { sysConfig } from '@/domain/SysConfig';

import adminRouters from './admin/router';

/**
 * 登录态初始化的总超时（毫秒）。
 * beforeEach 中 await initLoginState 一旦悬挂，导航将永不完成，
 * <router-view> 始终空白（整页白屏）。超时即按未登录处理，
 * 交给页面自行展示去登录提示，而不是把整页卡成白屏。
 */
const LOGIN_STATE_TIMEOUT_MS = 10000;

export const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        // 管理端
        ...adminRouters,
        {
            path: '/login',
            name: 'login',
            component: () => import('@/pages/shared/login.vue'),
            meta: {
                title: '登录',
                isFullContent: true,
            },
        },
        {
            path: '/logout',
            name: 'logout',
            component: () => import('@/pages/shared/login.vue'),
            meta: {
                title: '退出登录',
                isFullContent: true,
            },
        },
        {
            // 兼容旧入口：/ 与 /index
            path: '/',
            redirect: '/admin/index',
        },
        {
            path: '/index',
            redirect: '/admin/index',
        },
        {
            path: '/:pathMatch(.*)*',
            name: 'not-found',
            redirect: '/admin/index',
        },
    ],
});

router.beforeEach(async (to) => {
    // 切换路由取消请求
    abortAllPending();

    // 登录态校准：initLoginState 内部按「服务端快照 vs 运行期会话」四态决策，
    // 不会出现「旧快照覆盖新会话」把刚登录成功的用户踢回登录页的情况。
    //
    // 总超时兜底：initLoginState 内含向服务端核实登录态的请求，万一悬挂，
    // 导航不能永远卡在 beforeEach（会整页白屏）；超时即按「未登录」处理。
    const loggedIn = await Promise.race([
        initLoginState(),
        new Promise<boolean>((resolve) => {
            window.setTimeout(() => resolve(false), LOGIN_STATE_TIMEOUT_MS);
        }),
    ]);

    // 登录/登出入口本身不再跳登录：
    // SSO 未启用时登录入口就是本 SPA 的 /login 路由，若在登录页上也执行
    // 「未登录 → 跳登录」，就会形成「跳到登录页 → 守卫又跳登录页」的死循环，
    // 表现为页面不断刷新、永远停在登录页。
    const isAuthPage = to.name === 'login'
        || to.name === 'admin_login'
        || to.name === 'logout'
        || to.name === 'admin_logout'
        || to.meta?.isFullContent;

    // 未登录时跳转登录入口，不能只取消导航——否则会停留在无登录态的外壳页，
    // 界面可能仍显示本地残留的旧用户，而所有 /api 请求都被服务端以「需要登陆态」拒绝。
    if (!isAuthPage && decideGuardAction(loggedIn) === 'login') {
        return redirectToLogin();
    }
    return true;
});

router.afterEach((to) => {
    const projectTitle = sysConfig.title || '定时任务系统';
    if (to.meta?.title) {
        useTitle(`${to.meta.title} - ${projectTitle}`);
    } else {
        useTitle(projectTitle);
    }
});

export default router;
