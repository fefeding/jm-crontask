import Vue from 'vue';
import VueRouter from 'vue-router';
import TaskList from "../page/task/list.vue";
import TaskEdit from "../page/task/edit.vue";
import Instance from "../page/task/instance.vue";
import InstanceLog from "../page/task/log.vue";

Vue.use(VueRouter);

export default function createRouter(state) {
    return new VueRouter({
        mode: 'history',
        base: state.prefix?`/${state.prefix}/`: '/',
        routes: [
            {
                path: '/',
                component: TaskList
            },
            {
                path: '/task/list',
                component: TaskList
            },
            {
                path: '/task/edit',
                component: TaskEdit
            },
            {
                path: '/task/instance',
                component: Instance
            },
            {
                path: '/task/log',
                component: InstanceLog
            },
        ]
    });
}
