/*
 * @Author: 张明宣
 * @Date: 2024-08-14 17:31:59
 * @LastEditors: 张明宣
 * @LastEditTime: 2024-08-19 11:20:05
 * @FilePath: \recording\src\main.ts
 * @Description:
 *
 */
import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import store from './store';

const app = createApp(App);

app.use(ElementPlus, {
  locale: zhCn,
}).use(store).use(router).mount('#app');
