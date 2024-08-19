

<template>
  <el-container>
    <!-- <el-header v-if="!isFullContent">
    </el-header> -->
    <el-main :style="{padding: isFullContent?'0':'20px'}">
      <router-view v-slot="{ Component, route }">
        <transition
          name="fade-transform"
          mode="out-in"
        >
          <component :is="Component" :key="route.fullPath" />
        </transition>
      </router-view>
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
  isFullContent: {
    type: Boolean,
    default: false
  }
});

const isFullContent = computed(()=>{
  return props.isFullContent;
});
</script>

<style scoped lang="scss">
.el-header {
  padding-left: 0;
  padding-right: 0;
}
.el-container {
  height: 100vh;
}
.el-main {
  background-color: var(--system-container-background);
  height: 100%;
  overflow-x: hidden;
}
:deep(.el-main-box) {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
}

</style>
