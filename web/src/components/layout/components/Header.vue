<template>
  <header class="bg-dark text-white shadow-sm">
    <div class="container-fluid d-flex justify-content-between align-items-center p-3">
      <!-- 左侧Logo和标题 -->
      <div class="d-flex align-items-center">
        <!-- <button 
          class="btn btn-outline-light me-3 d-md-none"
          @click="$emit('toggle-sidebar')"
          aria-label="切换菜单"
        >
          <i class="bi bi-list"></i>
        </button> -->
        <div class="d-flex align-items-center">
          <i class="bi bi-clipboard-data fs-2 me-2"></i>
          <h1 class="h5 mb-0">{{sysConfig.title}} 管理端</h1>
        </div>
      </div>
      
      <!-- 右侧功能区 -->
      <div class="d-flex align-items-center gap-2">
        <!-- 搜索框 -->
        <!-- <div class="d-none d-md-block position-relative">
          <input 
            type="text" name="search"
            class="form-control form-control-sm bg-dark-subtle text-white border-0 rounded-pill ps-5"
            placeholder="搜索..."
            style="width: 200px;"
          >
          <i class="bi bi-search position-absolute right-3 top-50 ms-2 translate-middle-y text-muted"></i>
        </div> -->
        
        <!-- 通知按钮 -->
        <!-- <button class="btn btn-outline-light btn-sm rounded-circle border-0" aria-label="通知">
          <i class="bi bi-bell"></i>
        </button> -->
        
        <!-- 消息按钮 -->
        <!-- <button class="btn btn-outline-light btn-sm rounded-circle border-0" aria-label="消息">
          <i class="bi bi-envelope"></i>
        </button> -->
        
        <!-- 设置按钮 -->
        <!-- <button class="btn btn-outline-light btn-sm rounded-circle border-0" aria-label="设置">
          <i class="bi bi-gear"></i>
        </button> -->
        
        <!-- 用户菜单 -->
        <div class="dropdown">
          <button 
            class="btn btn-outline-light btn-sm border-0 rounded-circle dropdown-toggle" 
            type="button" 
            data-bs-toggle="dropdown" 
            aria-expanded="false"
            aria-label="用户菜单"
          >
            <i class="bi bi-person"></i>
          </button>
          <ul class="dropdown-menu dropdown-menu-end bg-dark border-light">
            <!-- <li><a class="dropdown-item text-white" href="#">个人资料</a></li>
            <li><a class="dropdown-item text-white" href="#">账号设置</a></li>
            <li><hr class="dropdown-divider bg-light"></li> -->
            <li><a class="dropdown-item text-white" href="#" @click.prevent="logoutHandler()">退出登录</a></li>
          </ul>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
// 引入指定的登录接口
import { logout, redirectToLogin } from '@/service/login';
import { sysConfig } from '@/domain/SysConfig';

const router = useRouter();

// 定义props类型
const props = defineProps<{
  sidebarOpened: boolean;
}>();

// 定义emit类型
const emit = defineEmits<{
  (e: 'toggle-sidebar'): void;
}>();

const logoutHandler = async () => {
  await logout();
  redirectToLogin();
  return false;
};
</script>

<style scoped>
header {
  z-index: 1020;
}

.btn-outline-light {
  transition: background-color 0.2s ease;
}

.btn-outline-light:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>
