/*
 * @Author: 张明宣
 * @Date: 2024-08-14 17:31:59
 * @LastEditors: 张明宣
 * @LastEditTime: 2024-08-20 17:09:48
 * @FilePath: \recording\src\router\index.ts
 * @Description:
 *
 */
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import NewRecord from '../views/NewRecord.vue';
import HistoryRecords from '../views/HistoryRecords.vue';
import PrintPreview from '../views/PrintPreview.vue';
import PartiesPage from '../views/PartiesPage.vue';
import PartiesPageNew from '../views/PartiesPageNew.vue';

import LitigantPage from '../views/LitigantPage.vue';
import FollowUpRecords from '../views/FollowUpRecords.vue';
import AcceptanceRegistrationForm from '../views/AcceptanceRegistrationForm.vue';
import MediationAgreement from '../views/MediationAgreement.vue';
import UpDataRecord from '../views/UpDataRecord.vue';
import VoiceprintPage from '../views/VoiceprintPage.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/NewRecord',
    name: '新建笔录',
    component: NewRecord,
  },
  {
    path: '/UpDataRecord-page',
    name: '修改笔录',
    component: UpDataRecord,
  },
  {
    path: '/history-records',
    name: '历史笔录',
    component: HistoryRecords,
  },
  {
    path: '/',
    name: '首页',
    component: PartiesPageNew,
  },
  {
    path: '/FollowUpRecords-page',
    name: '回访记录',
    component: FollowUpRecords,
  },
  {
    path: '/AcceptanceRegistrationForm-page',
    name: '受理登记表',
    component: AcceptanceRegistrationForm,
  },
  {
    path: '/MediationAgreement-page',
    name: '调解协议书',
    component: MediationAgreement,
  },
  {
    path: '/Parties1-page',
    name: '当事人1',
    component: LitigantPage,
  },
  {
    path: '/Print-preview',
    name: '打印预览',
    component: PrintPreview,
  },
  {
    path: '/Voiceprint-Page',
    name: '声纹录入',
    component: VoiceprintPage,
  },
  {
    path: '/Parties-page',
    name: '调查记录',
    component: PartiesPage,
  },

];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
