<!--
 * @Author: 张明宣
 * @Date: 2024-08-14 17:31:59
 * @LastEditors: 张明宣
 * @LastEditTime: 2024-08-15 11:43:15
 * @FilePath: \recording\src\App.vue
 * @Description:
 *                :style="{ position: shengchengwendangstoped ? 'static' : 'absolute', top: '40%', width: '85%', display: 'flex', justifyContent: 'center' }">
-->
<template>
  <div style="display: flex;flex-direction: column;height: 100vh;">
    <div :style="{ position: 'fixed', width: zhanshigaodu ? '50%' : '100%', 'z-index': '1000' }">
      <HeadView />
    </div>
    <div :style="containerStyles">
      <router-view :key="$route.fullPath" />
    </div>
  </div>
  <ChatDialog ref="chatDialog" />
</template>
<script lang="ts">
import {
  ref, provide, watch, onMounted, computed, ComponentPublicInstance,
} from 'vue';
import axios from 'axios';
import axiosInstance from '@/api/axios';
import HeadView from './components/HeadViewComponent.vue';
import ChatDialog from './components/ChatDialog.vue';

export default {
  name: 'App',
  components: {
    HeadView,
    ChatDialog,
  },
  setup() {
    const chatDialogRef = ref<ComponentPublicInstance<typeof ChatDialog> | null>(null);

    const itemList = ref([]);
    const proOriginalItem = ref([]);
    const divHeight = ref(50);
    const zhanshigaodu = ref(true);
    // 提供 itemList 及其更新函数
    provide('itemList', itemList);
    provide('proOriginalItem', proOriginalItem);
    provide('chatDialog', chatDialogRef);
    provide('divHeight', divHeight);
    provide('zhanshigaodu', zhanshigaodu);
    // 提供更新高度的方法
    provide('updateAppHeight', {
      update: (newHeight: number) => {
        divHeight.value = newHeight;
      },
    });
    const containerStyles = computed(() => ({
      marginTop: `${divHeight.value + 50}px`,
      display: 'flex',
      height: `calc(100vh - ${divHeight.value + 50}px)`,
    }));
    function getToken() {
      axios.get('http://localhost:8080/api/create-token', {
        params: {
          appid: 'sjmmzk90amylhk13',
          secret: 'YRMLWE54ZDYMFZIEBCRPEFZB',
        },
      })
        .then((response) => {
          if (response.data.status === 'SUCCESS') {
            const { token } = response.data.data;
            localStorage.setItem('token', token);
          }
        })
        .catch((error) => {
          console.error('获取token失败:', error);
        });
    }
    onMounted(() => {
      // getToken();
      watch(divHeight, (newValue) => {
        divHeight.value = newValue;
      });
    });
    return {
      itemList,
      proOriginalItem,
      chatDialog: chatDialogRef,
      divHeight,
      zhanshigaodu,
      containerStyles,
    };
  },
};
</script>
<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
