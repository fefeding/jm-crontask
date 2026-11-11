import { createRouter, createWebHistory } from 'vue-router';
import { useTitle } from '@vueuse/core';
import { abortAllPending } from '@/adapter/ajax';
import { initLoginState, redirectToLogin } from '@/service/login';
import { useSessionStore } from '@/stores/session';
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

    const sessionStore = useSessionStore();

    // 未登录时，用 token cookie / auth_code 向服务端核对一次登录态。
    // 已登录则跳过，避免每次导航都发请求。
    // 总超时兜底：initLoginState 内含向服务端核实的请求，万一悬挂，
    // 导航不能永远卡在 beforeEach（会整页白屏）。
    if (!sessionStore.isLoggedIn) {
        await Promise.race([
            initLoginState(),
            new Promise<boolean>((resolve) => {
                window.setTimeout(() => resolve(false), LOGIN_STATE_TIMEOUT_MS);
            }),
        ]);
    }

    // 需要登录态的页面：仍未登录则跳登录入口。
    // 必须中断本次导航，否则会停留在无登录态的外壳页，
    // 而所有 /api 请求都会被服务端以「需要登陆态」拒绝。
    if (to.meta?.needAuth && !sessionStore.isLoggedIn) {
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
