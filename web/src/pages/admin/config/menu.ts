import type { MenuItem } from '@/base/entity';

/**
 * 管理端菜单
 *
 * 使用 i18n key 作为 name，运行时翻译
 * 无 children 的条目渲染为一级常驻项，有 children 的条目渲染为可折叠分组
 */
export default [
    {
        id: '1',
        name: 'menu.dashboard',
        path: '/admin/index',
        icon: 'bi-grid-1x2',
    },
    {
        id: '2',
        name: 'menu.task',
        icon: 'bi-list-task',
        expanded: true,
        children: [
            {
                id: '21',
                name: 'menu.taskList',
                path: '/admin/task/list',
                icon: 'bi-list-ul',
            },
            {
                id: '22',
                name: 'menu.taskInstance',
                path: '/admin/task/instance',
                icon: 'bi-activity',
            },
            {
                id: '23',
                name: 'menu.taskLog',
                path: '/admin/task/log',
                icon: 'bi-file-earmark-text',
            },
        ],
    },
    {
        id: '3',
        name: 'menu.about',
        path: '/admin/about',
        icon: 'bi-info-circle',
    },
] as Array<MenuItem>;
