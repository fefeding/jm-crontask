import './assets/main.css';

import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap';

import router from './pages/router';
import { i18n } from '@/locales';

import toastPlugin from '@/components/toast/index';
import Modal from '@/components/modal/index.vue';
import DataGrid from '@/components/dataGrid/index.vue';

const app = createApp(App);
const pinia = createPinia();

// 持久化插件必须在 app.use(pinia) 之前注册，
// 否则 session store 的 persist 配置静默失效（刷新即掉登录态）
pinia.use(piniaPluginPersistedstate);

// @ts-ignore
app.use(router);
// @ts-ignore
app.use(pinia);
// @ts-ignore
app.use(i18n as any);

app.use(toastPlugin);
app.component('Modal', Modal);
app.component('DataGrid', DataGrid);

app.mount('#app');
