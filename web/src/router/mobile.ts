import { createRouter, createWebHistory } from 'vue-router';
import { abortAllPending } from '@/adapter/ajax';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            redirect: '/mobile/index',
        },
        {
            path: '/mobile',            
            children: [
                {
                    path: 'index',
                    name: 'index',
                    component: () => import('../views/mobile/index.vue'),
                },
            ],
        }
    ],
});

router.beforeEach((to, from, next) => {
    // 切换路由取消请求
    abortAllPending();
    next();
});

export default router;