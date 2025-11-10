import './assets/main.css';

import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';

import ElementPlus from 'element-plus';
import 'element-plus/theme-chalk/display.css' // 引入基于断点的隐藏类
import 'element-plus/dist/index.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';


import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap';

import router from './router/admin';

import toastPlugin from '@/components/toast/index';
import Modal from '@/components/modal/index.vue';
import DataGrid from '@/components/dataGrid/index.vue';

const app = createApp(App);
const pinia = createPinia();

// @ts-ignore
app.use(router);
// @ts-ignore
app.use(pinia);

app.use(toastPlugin);
app.component('Modal', Modal);
app.component('DataGrid', DataGrid);

// 注册 icons
for (const [key, comp] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, comp)
}
app.use(ElementPlus);


app.mount('#app');
