const routers = [
    {
        path: '/admin',
        component: () => import('@/pages/admin/components/layout/index.vue'),
        redirect: '/admin/index',
        children: [
            {
                path: 'index',
                name: 'index',
                component: () => import('../views/home.vue'),
                meta: {
                    title: '首页',
                    needAuth: true,
                },
            },
            {
                // 兼容旧深链：/admin/home → /admin/index
                path: 'home',
                redirect: '/admin/index',
                meta: {
                    needAuth: true,
                },
            },
            {
                path: 'task',
                name: 'task',
                redirect: '/admin/task/list',
                children: [
                    {
                        path: 'list',
                        name: 'task_list',
                        component: () => import('../views/task/list.vue'),
                        meta: {
                            title: '任务列表',
                            needAuth: true,
                        },
                    },
                    {
                        path: 'edit',
                        name: 'task_edit',
                        component: () => import('../views/task/edit.vue'),
                        meta: {
                            title: '任务编辑',
                            needAuth: true,
                        },
                    },
                    {
                        path: 'instance',
                        name: 'task_instance',
                        component: () => import('../views/task/instance.vue'),
                        meta: {
                            title: '任务实例',
                            needAuth: true,
                        },
                    },
                    {
                        path: 'log',
                        name: 'task_log',
                        component: () => import('../views/task/log.vue'),
                        meta: {
                            title: '运行日志',
                            needAuth: true,
                        },
                    },
                ],
            },
            {
                path: 'about',
                name: 'about',
                component: () => import('../views/about.vue'),
                meta: {
                    title: '关于系统',
                    needAuth: true,
                },
            },
            {
                path: 'login',
                name: 'admin_login',
                component: () => import('@/pages/shared/login.vue'),
                meta: {
                    title: '登录',
                    isFullContent: true,
                },
            },
            {
                path: 'logout',
                name: 'admin_logout',
                component: () => import('@/pages/shared/login.vue'),
                meta: {
                    title: '退出登录',
                    isFullContent: true,
                },
            },
        ],
    },
];

export default routers;
