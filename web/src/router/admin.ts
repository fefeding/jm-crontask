
import { createRouter, createWebHistory } from 'vue-router';
import { abortAllPending } from '@/adapter/ajax';
import { checkLogin } from '@/service/login';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            component: ()=>import('../components/layout/index.vue'),
            redirect: '/admin/home',
            children: [
                {
                    path: 'admin/about',
                    name: 'about',
                    // route level code-splitting
                    // this generates a separate chunk (About.[hash].js) for this route
                    // which is lazy-loaded when the route is visited.
                    component: () => import('../views/admin/aboutView.vue'),
                },
                {
                    path: 'admin/home',
                    name: 'Home',
                    alias: 'index',
                    meta: { title: '首页', needAuth: true },
                    // route level code-splitting
                    // this generates a separate chunk (About.[hash].js) for this route
                    // which is lazy-loaded when the route is visited.
                    component: () => import('../views/admin/homeView.vue'),
                },
                {
                    path: 'admin/login',
                    name: 'login',
                    component: () => import('../views/admin/login.vue'),
                },
                {
                    path: 'admin/logout',
                    name: 'logout',
                    component: () => import('../views/admin/login.vue'),
                },
                {
                    path: 'admin/task',
                    name: 'task',
                    children: [
                        {
                            path: 'list',
                            name: 'task_list',
                            meta: { title: '任务列表', needAuth: true },
                            component: () => import('../views/admin/task/list.vue'),
                        },
                        {
                            path: 'edit',
                            name: 'task_edit',
                            meta: { title: '任务编辑', needAuth: true },
                            component: () => import('../views/admin/task/edit.vue'),
                        },
                        {
                            path: 'instance',
                            name: 'task_instance',
                            meta: { title: '任务实例', needAuth: true },
                            component: () => import('../views/admin/task/instance.vue'),
                        },
                        {
                            path: 'log',
                            name: 'task_log',
                            meta: { title: '日志', needAuth: true },
                            component: () => import('../views/admin/task/log.vue'),
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

    // 校验登陆态
    if(to.meta?.needAuth) {        
        checkLogin();
    }
    
    next();
});

export default router;