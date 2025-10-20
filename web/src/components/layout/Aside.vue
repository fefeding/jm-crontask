<template>
  <aside 
    class="bg-dark shadow-md h-100 transition-all duration-300 ease-in-out overflow-y-auto"
    :style="{ 
      width: opened ? '250px' : '60px',
      overflow: opened ? 'auto' : 'visible',
      'flex-shrink': 0
    }">
    <nav class="h-100 d-flex flex-column">
      <!-- 管理端标题 -->
      <div class="p-3 py-3 bg-gradient-to-r from-primary/20 to-transparent d-flex justify-content-center items-center">
        <div class="d-flex align-items-center gap-2">
          <div class="bg-primary/20 p-2 rounded-circle flex-shrink-0">
            <i class="bi bi-clipboard-data fs-2 text-primary"></i>
          </div>
          <h1 class="h5 mb-0 text-white" v-if="opened">
            {{ sysConfig.title }} 管理端
          </h1>
        </div>
      </div>

      <!-- 菜单列表 -->
      <ul class="nav flex-column p-2 m-0" :class="{ 'px-1': !opened, 'px-2': opened }">
        <li class="nav-item mb-1 w-100" v-for="item in menuItems" :key="item.id">
          <!-- 无子菜单的菜单项 -->
          <template v-if="!item.children || item.children.length === 0">
            <router-link 
              class="nav-link d-flex align-items-center gap-3 p-2 rounded transition-all duration-200"
              :class="{ 'bg-primary text-white': isActive(item) }"
              :to="item.path || ''"
              :title="!opened ? item.name : ''"
              :style="{ 
                justifyContent: opened ? 'flex-start' : 'center',
                width: '100%',
                boxSizing: 'border-box'
              }"
            >
              <i class="bi" :class="item.icon" style="width: 24px; text-align: center; flex-shrink: 0;"></i>
              <span v-if="opened" class="transition-opacity duration-200">{{ item.name }}</span>
            </router-link>
          </template>
          
          <!-- 有子菜单的菜单项 -->
          <template v-else>
            <!-- 父菜单按钮 -->
            <button 
              class="nav-link d-flex justify-content-between align-items-center gap-3 p-2 rounded w-100 text-start transition transition-all duration-200"
              :class="{ 'bg-primary text-white': isActive(item) || hasActiveChild(item) }"
              @click.stop="toggleSubMenu(item.id)"
              :title="!opened ? item.name : ''"
              :style="{ 
                justifyContent: opened ? 'space-between' : 'center',
                width: '100%',
                boxSizing: 'border-box'
              }"
            >
              <div class="d-flex align-items-center gap-3">
                <i class="bi" :class="item.icon" style="width: 24px; text-align: center; flex-shrink: 0;"></i>
                <span v-if="opened">{{ item.name }}</span>
              </div>
              <i 
                class="bi transition-transform duration-200" 
                :class="subMenuOpen[item.id] ? 'bi-chevron-down' : 'bi-chevron-right'"
                v-if="opened"
              ></i>
            </button>
            
            <!-- 子菜单列表 - 收起时自动隐藏 -->
            <ul 
              class="nav flex-column mt-1 overflow-hidden transition-all duration-300 ease-in-out"
              :class="{
                'd-block': (subMenuOpen[item.id] || hasActiveChild(item)) && opened,
                'd-none': !((subMenuOpen[item.id] || hasActiveChild(item)) && opened)
              }"
              :style="{
                maxHeight: (subMenuOpen[item.id] || hasActiveChild(item)) && opened ? `${item.children.length * 50}px` : '0',
                opacity: (subMenuOpen[item.id] || hasActiveChild(item)) && opened ? '1' : '0',
                paddingLeft: opened ? '0' : '0',
                width: '100%'
              }"
            >
              <li class="nav-item mb-1" v-for="child in item.children" :key="child.id">
                <router-link 
                  class="nav-link d-flex align-items-center gap-3 p-2 rounded transition-all duration-200 submenu-item"
                  :class="{ 'bg-primary-light text-primary': isActive(child) }"
                  :to="child.path || ''"
                  :title="!opened ? child.name : ''"
                  :style="{ 
                    justifyContent: opened ? 'flex-start' : 'center',
                    width: '100%',
                    boxSizing: 'border-box'
                  }"
                >
                  <i class="bi" :class="child.icon" style="width: 48px; text-align: center; flex-shrink: 0;"></i>
                  <span v-if="opened" class="transition-opacity duration-200">{{ child.name }}</span>
                </router-link>
              </li>
            </ul>
          </template>
        </li>
      </ul>
      
      <!-- 个人信息/用户菜单 -->
      <div class="p-3 py-3 mt-auto" :style="{ width: '100%', boxSizing: 'border-box' }">
        <div class="d-flex align-items-center gap-3" v-if="opened && session.isLoggedIn">
          <!-- 用户头像 -->
          <div class="position-relative avatar-preview">
            <img 
              :src="avatarUrl" 
              alt="用户头像" 
              class="rounded-circle object-cover border border-white/20"
              width="40" 
              height="40"
            >
            <span class="position-absolute bottom-0 right-0 w-3 h-3 bg-success border border-dark rounded-circle"></span>
          </div>
          
          <!-- 用户信息和菜单 -->
          <div class="flex-grow-1 min-w-0">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <p class="text-white fw-medium mb-0 truncate">{{ session.user?.name }}</p>
                <p class="text-secondary text-xs mb-0">{{ session.account?.account }}</p>
              </div>
              
              <div class="dropdown">
                <button 
                  class="btn btn-link text-white/60 p-1" 
                  type="button" 
                  data-bs-toggle="dropdown" 
                  aria-expanded="false"
                  aria-label="用户菜单"
                >
                  <i class="bi bi-three-dots-vertical"></i>
                </button>
                <ul class="dropdown-menu dropdown-menu-end bg-dark border-light shadow-lg">
                  <li><router-link class="dropdown-item text-white hover:bg-white/10" to="/admin/system/profile">个人资料</router-link></li>
                  <!-- <li><a class="dropdown-item text-white hover:bg-white/10" href="#">账号设置</a></li> -->
                  <li><hr class="dropdown-divider bg-white/10"></li>
                  <li><a class="dropdown-item text-white hover:bg-white/10" href="#" @click.prevent="logoutHandler()">退出登录</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 菜单收起时只显示头像 -->
        <div v-else-if="session.isLoggedIn" class="d-flex justify-content-center py-1">
          <div class="dropdown position-static avatar-preview ">
            <button 
              class="btn p-0 rounded-circle" 
              type="button" 
              data-bs-toggle="dropdown" 
              aria-expanded="false"
              aria-label="用户菜单"
              :title="session.user?.name || '用户菜单'"
            >
              <img 
                :src="avatarUrl" 
                alt="用户头像" 
                class="rounded-circle object-cover border border-white/20"
                width="36" 
                height="36"
              >
            </button>
            <ul class="dropdown-menu dropdown-menu-end bg-dark border-light shadow-lg" style="right: 0; left: auto;">
              <li><router-link class="dropdown-item text-white hover:bg-white/10" to="/admin/system/profile">个人资料</router-link></li>
              <!-- <li><a class="dropdown-item text-white hover:bg-white/10" href="#">账号设置</a></li> -->
              <li><hr class="dropdown-divider bg-white/10"></li>
              <li><a class="dropdown-item text-white hover:bg-white/10" href="#" @click.prevent="logoutHandler()">退出登录</a></li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 底部折叠按钮 -->
      <div class="p-3 py-2" :style="{ width: '100%', boxSizing: 'border-box' }">
        <button 
          class="btn btn-outline-secondary btn-sm w-100 border-0 rounded transition-all duration-200"
          @click="$emit('toggle-sidebar')"
          aria-label="折叠菜单"
          :title="opened ? '收起菜单' : '展开菜单'"
        >
          <i class="bi transition-transform duration-200" :class="opened ? 'bi-chevron-left' : 'bi-chevron-right'"></i>
        </button>
      </div>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { reactive, computed, watch, onMounted } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { sysConfig } from '@/domain/SysConfig';
import type { MenuItem } from "@/base/entity";
import { logout, redirectToLogin } from '@/service/login';
import { useSessionStore } from '@/stores/session';
import * as userService from '@/service/account';

// 初始化session store
const session = useSessionStore();

// 定义组件接收的props
const props = defineProps<{
  opened: boolean;
  menus: Array<MenuItem>;
}>();

// 定义组件发出的事件
const emit = defineEmits<{
  (e: 'toggle-sidebar'): void;
}>();

// 获取当前路由信息和路由实例
const route = useRoute();
const router = useRouter();
const currentPath = computed(() => route.path);

// 子菜单展开状态管理
const subMenuOpen = reactive<Record<string, boolean>>({});

const avatarUrl = computed(() => {
  let url = session.user?.avatar || '';
  if(!url) {
    url = userService.getAvatarUrl(session.userId as number);
  }
  return url;
});

/**
 * 切换子菜单展开/收起状态
 */
const toggleSubMenu = (id: string) => {
  subMenuOpen[id] = !subMenuOpen[id];
};

/**
 * 检查菜单项是否为当前激活状态
 */
const isActive = (item: MenuItem) => {
  return currentPath.value === item.path || 
         currentPath.value.startsWith(`${item.path}/`);
};

/**
 * 检查子菜单中是否有激活项
 */
const hasActiveChild = (item: MenuItem) => {
  if (!item.children || item.children.length === 0) return false;
  return item.children.some(child => isActive(child));
};

/**
 * 退出登录处理函数
 */
const logoutHandler = async () => {
  await logout();
  redirectToLogin();
  return false;
};

// 菜单数据
const menuItems = computed(()=> props.menus);

/**
 * 初始化子菜单状态
 */
const initSubMenuStates = () => {
  menuItems.value?.forEach(item => {
    if (item.children && item.children.length > 0) {
      if (subMenuOpen[item.id] === undefined) {
        subMenuOpen[item.id] = hasActiveChild(item);
      }
    }
  });
};

// 组件挂载后初始化状态
onMounted(() => {
  initSubMenuStates();
});

// 监听路由变化，更新子菜单状态
watch(
  () => currentPath.value,
  () => {
    initSubMenuStates();
  }
);

// 监听菜单展开/收起状态变化
watch(
  () => props.opened,
  (newVal) => {
    // 菜单收起时自动关闭所有子菜单
    if (!newVal) {
      Object.keys(subMenuOpen).forEach(key => {
        subMenuOpen[key] = false;
      });
    } else {
      initSubMenuStates();
    }
  },
  { immediate: true }
);
</script>

<style scoped>
aside {
  overflow-y: auto;
  flex-shrink: 0;
  background-color: #1e293b !important;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}

.nav-link {
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;
  text-decoration: none;
  background-color: transparent;
  width: 100%;
  box-sizing: border-box;
}

.nav-link:hover:not(.bg-primary) {
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.nav-link.bg-primary {
  background-color: var(--bs-primary) !important;
  color: white !important;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.nav-link.bg-primary-light {
  background-color: rgba(var(--bs-primary-rgb), 0.15) !important;
  color: var(--bs-primary) !important;
}

/* 子菜单样式 */
.submenu-item {
  background-color: rgba(255, 255, 255, 0.05) !important;
  padding-left: 1.5rem !important;
}

.submenu-item:hover:not(.bg-primary-light) {
  background-color: rgba(255, 255, 255, 0.12) !important;
}

/* 滚动条美化 */
aside::-webkit-scrollbar {
  width: 6px;
}

aside::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

aside::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

aside::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.btn-outline-secondary {
  color: rgba(255, 255, 255, 0.7);
  background-color: rgba(255, 255, 255, 0.05);
}

.btn-outline-secondary:hover {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.15);
}

/* 标题区域样式 */
h1.h5 {
  font-weight: 600;
  line-height: 1.2;
}

/* 用户菜单样式 */
.dropdown-menu {
  min-width: 160px;
  border-radius: 0.5rem;
  margin-top: 0.5rem;
  border-color: rgba(255, 255, 255, 0.2);
}

.dropdown-item {
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;
  padding: 0.5rem 1rem;
}

.dropdown-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.avatar-preview {
  max-width: 2.5rem;
  width: 100%;
  /* 定义Grid容器，宽高比1:1 */
  display: grid;
  aspect-ratio: 1 / 1; /* 核心：直接设置宽高比（现代CSS特性） */
  overflow: hidden;
}
.avatar-preview img {
  transition: all 0.3s ease;
  max-width: 100%;
  max-height: 100%;
  object-fit: cover; 
}
</style>
