<template>
  <div class="flex layout-container">
    <Aside />
    <Content />
  </div>
</template>

<script setup lang="ts">
import Aside from './components/Aside.vue';
import Content from './components/Content.vue';
</script>

<style scoped lang="scss">
.layout-container {
}
</style>
