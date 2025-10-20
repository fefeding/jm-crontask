import './assets/main.css';

import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';

import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import router from './router/admin';

const app = createApp(App);
const pinia = createPinia();

// @ts-ignore
app.use(router);
// @ts-ignore
app.use(pinia);

app.use(ElementPlus);

app.mount('#app');
