<template>
  <main class="admin-main-content">
    <!-- 页面内容 -->
    <div class="content-wrapper admin-scrollbar" :class="{ 'full-content': isFullContent }">
      <router-view v-slot="{ Component, route }">
        <transition name="admin-fade">
          <component :is="Component" :key="route.fullPath" />
        </transition>
      </router-view>
    </div>
  </main>
</template>

<script setup lang="ts">
import { onErrorCaptured } from 'vue';

defineProps({
  isFullContent: {
    type: Boolean,
    default: false
  }
});

// 捕获子组件错误，防止白屏
onErrorCaptured((err, instance, info) => {
  console.error('页面组件错误:', err, info);
  return false;
});
</script>
