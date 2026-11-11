<template>
  <div class="admin-layout">
    <!-- 侧边栏 -->
    <Sidebar
      v-if="!isFullContent"
      :menus="menus"
      :opened="sidebarOpened"
      @toggle-sidebar="toggleSidebar"
    />

    <!-- 内容区域（无顶栏，侧边栏承载品牌、折叠与用户入口） -->
    <MainContent :isFullContent="isFullContent" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import Sidebar from './components/Aside.vue';
import MainContent from './components/Content.vue';

import menus from '../../config/menu';

// 管理后台主题样式（布局 / 侧边栏 / 内容区样式集中在此全局样式表）
import '../../styles/admin-theme.scss';

// 侧边栏默认展开的最小视口宽度：宽度足够时默认展开，否则默认收起
const SIDEBAR_EXPAND_MIN_WIDTH = 1200;

// 侧边栏状态管理
const sidebarOpened = ref(window.innerWidth >= SIDEBAR_EXPAND_MIN_WIDTH);

// 切换侧边栏显示状态
const toggleSidebar = () => {
  sidebarOpened.value = !sidebarOpened.value;
};

const router = useRouter();
const isFullContent = computed<boolean>(()=>{
  return !!(router.currentRoute?.value.name === 'login' || router.currentRoute?.value.name === 'logout' || router.currentRoute?.value?.meta?.isFullContent);
});
</script>
