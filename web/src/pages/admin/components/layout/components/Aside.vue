<template>
  <aside class="admin-sidebar d-flex flex-column" :class="{ collapsed: isCollapsed }">
    <!-- 品牌区 -->
    <div class="sidebar-header">
      <router-link to="/admin/index" class="brand-link">
        <img src="/src/assets/logo.webp" class="brand-image" alt="" />
        <span v-if="!isCollapsed" class="logo-text">{{ sysConfig.title }}</span>
      </router-link>
      <button
        class="collapse-btn"
        :title="isCollapsed ? t('admin.sidebar.expand') : t('admin.sidebar.collapse')"
        @click.stop="emit('toggle-sidebar')"
      >
        <i class="bi" :class="isCollapsed ? 'bi-chevron-right' : 'bi-chevron-left'"></i>
      </button>
    </div>

    <!-- 主导航：一级常驻项 + 分组折叠 -->
    <nav class="sidebar-nav flex-grow-1 overflow-y-auto overflow-x-hidden admin-scrollbar">
      <!-- 一级常驻项（无子菜单，始终可见） -->
      <ul class="nav flex-column nav-top-items">
        <li v-for="item in topItems" :key="item.id" class="nav-item">
          <router-link
            :to="item.path || ''"
            class="nav-link"
            active-class="active"
            :title="isCollapsed ? t(item.name) : ''"
          >
            <i class="bi" :class="getBootstrapIcon(item.icon)"></i>
            <span v-if="!isCollapsed">{{ t(item.name) }}</span>
          </router-link>
        </li>
      </ul>

      <!-- 分组菜单 -->
      <div v-for="group in menuGroups" :key="group.id" class="nav-group">
        <div
          class="nav-group-header"
          :class="{ active: isGroupActive(group) }"
          :title="isCollapsed ? t(group.name) : ''"
          @click="toggleGroup(group.id)"
        >
          <i class="bi nav-group-icon" :class="getBootstrapIcon(group.icon)"></i>
          <span v-if="!isCollapsed" class="nav-group-label">{{ t(group.name) }}</span>
          <i
            v-if="!isCollapsed"
            class="bi bi-chevron-down nav-group-chevron"
            :class="{ collapsed: !openGroups[group.id] }"
          ></i>
        </div>

        <ul v-show="isCollapsed || openGroups[group.id]" class="nav flex-column nav-group-items">
          <li v-for="child in group.children || []" :key="child.id" class="nav-item">
            <router-link
              :to="child.path || ''"
              class="nav-link"
              active-class="active"
              :title="isCollapsed ? t(child.name) : ''"
            >
              <i class="bi" :class="getBootstrapIcon(child.icon)"></i>
              <span v-if="!isCollapsed">{{ t(child.name) }}</span>
            </router-link>
          </li>
        </ul>
      </div>
    </nav>

    <!-- 底部：语言 / 全屏 / 用户 合并为一行紧凑入口 -->
    <div class="sidebar-footer" :class="{ 'is-collapsed': isCollapsed }">
      <div class="footer-tools">
        <LangSwitch />
        <button
          class="footer-icon"
          :title="isFullscreen ? t('admin.sidebar.exitFullscreen') : t('admin.sidebar.fullscreen')"
          @click="toggleFullscreen"
        >
          <i class="bi" :class="isFullscreen ? 'bi-fullscreen-exit' : 'bi-fullscreen'"></i>
        </button>
      </div>

      <template v-if="!isCollapsed">
        <div class="footer-user">
          <div class="user-avatar">{{ avatarText }}</div>
          <div class="user-name text-truncate">{{ displayName }}</div>
          <button class="btn-logout" :title="t('admin.header.logout')" @click="logoutHandler">
            <i class="bi bi-box-arrow-right"></i>
          </button>
        </div>
      </template>
      <button v-else class="footer-icon" :title="t('admin.header.logout')" @click="logoutHandler">
        <i class="bi bi-box-arrow-right"></i>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { reactive, computed, ref, watch, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { sysConfig } from '@/domain/SysConfig';
import type { MenuItem } from '@/base/entity';
import { useSessionStore } from '@/stores/session';
import { logout, redirectToLogin } from '@/service/login';
import LangSwitch from '@/components/LangSwitch.vue';

const { t } = useI18n();
const session = useSessionStore();
const props = defineProps<{
  opened: boolean;
  menus?: Array<MenuItem>;
}>();

const emit = defineEmits<{
  (e: 'toggle-sidebar'): void;
}>();

const route = useRoute();
const currentPath = computed(() => route.path);

const isCollapsed = computed(() => !props.opened);

// 图标映射表：将字符串映射到 Bootstrap Icons
const iconMap: Record<string, string> = {
  'dashboard': 'bi-grid-1x2',
  'home': 'bi-house-door',
  'house': 'bi-house-door',
  'grid': 'bi-grid',
  'user': 'bi-person',
  'users': 'bi-people',
  'userfilled': 'bi-person-fill',
  'account': 'bi-person-gear',
  'settings': 'bi-gear',
  'setting': 'bi-gear',
  'sliders': 'bi-sliders',
  'table': 'bi-table',
  'list': 'bi-list-ul',
  'grid-fill': 'bi-grid-fill',
  'copy': 'bi-file-earmark',
  'clone': 'bi-files',
  'calendar': 'bi-calendar',
  'map': 'bi-geo-alt',
  'envelope': 'bi-envelope',
  'envelope-open': 'bi-envelope-open',
  'bell': 'bi-bell',
  'bell-slash': 'bi-bell-slash',
  'shopping-cart': 'bi-cart3',
  'chart': 'bi-bar-chart',
  'chart-line': 'bi-graph-up',
  'chart-pie': 'bi-pie-chart',
  'file': 'bi-file-earmark',
  'files': 'bi-files',
  'folder': 'bi-folder',
  'folder-open': 'bi-folder2-open',
  'lock': 'bi-lock',
  'unlock': 'bi-unlock',
  'key': 'bi-key',
  'search': 'bi-search',
  'filter': 'bi-funnel',
  'plus': 'bi-plus',
  'minus': 'bi-dash',
  'times': 'bi-x',
  'check': 'bi-check',
  'edit': 'bi-pencil',
  'save': 'bi-save',
  'delete': 'bi-trash',
  'trash': 'bi-trash',
  'upload': 'bi-upload',
  'download': 'bi-download',
  'refresh': 'bi-arrow-clockwise',
  'sync': 'bi-arrow-clockwise',
  'expand': 'bi-arrows-angle-expand',
  'compress': 'bi-arrows-angle-contract',
  'fullscreen': 'bi-fullscreen',
  'exit-fullscreen': 'bi-fullscreen-exit',
  'angle-left': 'bi-chevron-left',
  'angle-right': 'bi-chevron-right',
  'angle-up': 'bi-chevron-up',
  'angle-down': 'bi-chevron-down',
  'chevron-left': 'bi-chevron-left',
  'chevron-right': 'bi-chevron-right',
  'chevron-up': 'bi-chevron-up',
  'chevron-down': 'bi-chevron-down',
  'arrow-left': 'bi-arrow-left',
  'arrow-right': 'bi-arrow-right',
  'arrow-up': 'bi-arrow-up',
  'arrow-down': 'bi-arrow-down',
  'star': 'bi-star',
  'star-fill': 'bi-star-fill',
  'heart': 'bi-heart',
  'heart-fill': 'bi-heart-fill',
  'circle': 'bi-circle',
  'circle-fill': 'bi-circle-fill',
};

// 获取 Bootstrap 图标类名
const getBootstrapIcon = (iconName?: string): string => {
  if (!iconName) return 'bi-circle';

  // 已经是 bi- 开头的，直接返回
  if (iconName.startsWith('bi-')) {
    return iconName;
  }

  // 兼容 el-icon-xxx 形式，提取后面的部分
  let name = iconName.replace('el-icon-', '');

  // 转换为小写
  name = name.toLowerCase();

  return iconMap[name] || 'bi-circle';
};

const menuGroups = computed<MenuItem[]>(() =>
  (props.menus || []).filter((item) => (item.children || []).length > 0)
);

const topItems = computed<MenuItem[]>(() =>
  (props.menus || []).filter((item) => (item.children || []).length === 0)
);

// 分组展开状态：key 为分组 id
const openGroups = reactive<Record<string, boolean>>({});

const isItemActive = (item: MenuItem) => {
  if (!item.path) return false;
  return currentPath.value === item.path || currentPath.value.startsWith(`${item.path}/`);
};

const isGroupActive = (group: MenuItem) =>
  (group.children || []).some((child) => isItemActive(child));

const toggleGroup = (id: string) => {
  openGroups[id] = !openGroups[id];
};

/**
 * 初始化分组展开状态：默认按配置展开，并自动展开当前路由所在分组。
 * 手动折叠过的分组不会被再次打开（仅在首次渲染 / 路由变化时补齐未初始化的项）。
 */
const syncOpenGroups = () => {
  menuGroups.value.forEach((group) => {
    if (openGroups[group.id] === undefined) {
      openGroups[group.id] = group.expanded !== false;
    }
  });
  const activeGroup = menuGroups.value.find((group) => isGroupActive(group));
  if (activeGroup) openGroups[activeGroup.id] = true;
};

const displayName = computed(() => session.userName || t('common.admin'));
const avatarText = computed(() => displayName.value.charAt(0).toUpperCase());

// 全屏切换
const isFullscreen = ref(false);

const syncFullscreen = () => {
  isFullscreen.value = !!document.fullscreenElement;
};

const toggleFullscreen = () => {
  if (document.fullscreenElement) {
    document.exitFullscreen?.();
  } else {
    document.documentElement.requestFullscreen?.();
  }
};

const logoutHandler = async () => {
  await logout();
  session.clearSession();
  redirectToLogin();
};

onMounted(() => {
  syncOpenGroups();
  syncFullscreen();
  document.addEventListener('fullscreenchange', syncFullscreen);
});

// 路由切换时自动展开包含当前路由的分组
watch(currentPath, syncOpenGroups);

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', syncFullscreen);
});
</script>
