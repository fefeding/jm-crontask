import './assets/main.css';

import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';

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

app.mount('#app');
