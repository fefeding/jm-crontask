
import Layout from '../components/layout/index.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { abortAllPending } from '@/adapter/ajax';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/admin',
            component: Layout,
            redirect: '/admin/about',
            children: [
                {
                    path: 'about',
                    name: 'about',
                    // route level code-splitting
                    // this generates a separate chunk (About.[hash].js) for this route
                    // which is lazy-loaded when the route is visited.
                    component: () => import('../views/admin/aboutView.vue'),
                },
                {
                    path: 'home',
                    name: 'Home',
                    // route level code-splitting
                    // this generates a separate chunk (About.[hash].js) for this route
                    // which is lazy-loaded when the route is visited.
                    component: () => import('../views/admin/homeView.vue'),
                },
                {
                    path: 'task',
                    name: 'task',
                    children: [
                        {
                            path: 'list',
                            name: 'list',
                            component: () => import('../views/admin/task/list.vue'),
                        },
                    ]
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