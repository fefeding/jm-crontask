import { createRouter, createWebHistory } from 'vue-router';
import { abortAllPending } from '@/adapter/ajax';
import Layout from '../components/layout/index.vue';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            component: Layout,
            redirect: '/about',
            children: [
                {
                    path: '/about',
                    name: 'about',
                    // route level code-splitting
                    // this generates a separate chunk (About.[hash].js) for this route
                    // which is lazy-loaded when the route is visited.
                    component: () => import('../views/AboutView.vue'),
                },
                {
                    path: '/home',
                    name: 'Home',
                    // route level code-splitting
                    // this generates a separate chunk (About.[hash].js) for this route
                    // which is lazy-loaded when the route is visited.
                    component: () => import('../views/HomeView.vue'),
                },
            ],
        },
    ],
});

router.beforeEach((to, from, next) => {
    // 切换路由取消请求
    abortAllPending();
    next();
});

export default router;
