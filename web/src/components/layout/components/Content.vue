<template>
  <main class="p-4">
    <!-- 面包屑导航 -->
    <nav aria-label="breadcrumb" class="mb-4" v-if="!isFullContent">
      <ol class="breadcrumb">
        <!-- 首页固定项，跳转至/admin/index -->
        <li class="breadcrumb-item">
          <router-link to="/admin/index" class="text-decoration-none">首页</router-link>
        </li>
        
        <!-- 动态生成其他层级 -->
        <li 
          v-for="(item, index) in breadcrumbItems" 
          :key="index" 
          class="breadcrumb-item"
          :class="{ 'active': index === breadcrumbItems.length - 1 }"
          aria-current="page"
        >
          <router-link 
            v-if="index !== breadcrumbItems.length - 1"
            :to="item.path" 
            class="text-decoration-none"
          >
            {{ item.meta.title }}
          </router-link>
          <span v-else>{{ item.meta.title }}</span>
        </li>
      </ol>
    </nav>

    <router-view v-slot="{ Component, route }">
        <component :is="Component" :key="route.fullPath" />
    </router-view>
  </main>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

const props = defineProps({
  isFullContent: {
    type: Boolean,
    default: false
  }
});

const route = useRoute();
const isFullContent = computed(() => props.isFullContent);

// 动态计算面包屑数据
const breadcrumbItems = computed(() => {
  return route.matched
    .filter(item => item.meta && item.meta.title)
    .filter(item => item.path !== '/admin/index'); // 排除首页，避免重复显示
});
</script>

<style scoped lang="scss">
main {
  background-color: #f8f9fa;
}

// 面包屑容器样式
.breadcrumb {
  display: flex;
  flex-wrap: wrap;
  margin: 0;
  padding: 0;
  list-style: none;
}

// 面包屑项样式
.breadcrumb-item {
  position: relative;
  padding: 0 1rem;

  // 分隔符样式（除了第一个元素）
  &:not(:first-child)::before {
    content: "/";
    position: absolute;
    left: -6px;
    color: #6c757d; // 分隔符颜色
  }

  // 第一个元素不需要左侧内边距
  &:first-child {
    padding-left: 0;
  }

  // 激活项样式
  &.active {
    color: #6c757d;
  }
}
</style>