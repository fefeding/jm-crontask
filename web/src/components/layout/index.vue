<template>
  <div class="layout-container">
    <el-container>
      <!--<el-header>
      </el-header>-->
      <el-container>
        <Aside v-if="!isFullContent" :menus="menus" />
        <Content :isFullContent="isFullContent" />
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import Aside from './components/Aside.vue';
import Content from './components/Content.vue';
import menus from '../../base/menu';

const router = useRouter();
const isFullContent = computed(()=>{
  return router.currentRoute.value.name === 'login' || router.currentRoute.value.name === 'logout';
});
</script>

<style scoped lang="scss">
.layout-container {
  /*height: 100vh;
  overflow: hidden;*/
  background-size: cover;
  backdrop-filter: blur(10px);
}
</style>
