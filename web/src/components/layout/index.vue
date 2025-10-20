<template>  
  <div class="app-container d-flex flex-column vh-100 overflow-hidden">
    <!-- 头部组件 -->
    <!-- <Header 
      v-if="!isFullContent"
      :sidebar-opened="sidebarOpened" 
      @toggle-sidebar="toggleSidebar"
    /> -->
    
    <div class="d-flex flex-fill overflow-hidden">
      <!-- 侧边栏组件 -->
      <Sidebar 
        :menus="menus"
        v-if="!isFullContent"
        :opened="sidebarOpened" 
        @toggle-sidebar="toggleSidebar"
        @navigate="handleNavigate"
      />
      
      <!-- 主内容区域 -->
      <div class="flex-fill overflow-y-auto">
        <MainContent :isFullContent="isFullContent" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

//import Header from './Header.vue';
import Sidebar from './Aside.vue';
import MainContent from './Content.vue';

import menus from '../../base/menu';

// 侧边栏状态管理
const sidebarOpened = ref(true);

// 切换侧边栏显示状态
const toggleSidebar = () => {
  sidebarOpened.value = !sidebarOpened.value;
};
// 处理导航事件
const handleNavigate = (path: string) => {
  // 实际项目中可以使用vue-router进行导航
  console.log('导航到:', path);
};

const router = useRouter();
const isFullContent = computed<boolean>(()=>{
  return !!(router.currentRoute?.value.name === 'login' || router.currentRoute?.value.name === 'logout' || router.currentRoute?.value?.meta?.isFullContent);
});
</script>

<style scoped lang="scss">

</style>
