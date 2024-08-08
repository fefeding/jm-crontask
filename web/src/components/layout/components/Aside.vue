<template>
  <div
    class="aside-container pt-9 flex flex-col h-screen"
    :class="{ 'collapse-wrap': collapse }"
  >
    <div class="logo-container flex pl-6 pr-6">
      <img src="@/assets/logo.webp" class="w-7 mr-2" alt="" />
      <span class="logo-container--title">{{ title }}</span>
    </div>
    <div class="flex-1 pt-20">
      <!-- 菜单 -->
      <el-menu
        :default-active="$route.path"
        :collapse-transition="false"
        background-color="#0000"
        :collapse="collapse"
        :unique-opened="true"
        @select="selectMenu"
      >
        <div v-for="(menu, _index) in navMenus" :key="_index">
          <el-sub-menu v-if="menu.children" :index="menu.path || menu.index">
            <template #title>
              <img width="33" :src="menu.icon" alt="" />
              <span>{{ menu.name }}</span>
            </template>
            <el-menu-item
              v-for="subMenu in menu.children"
              :key="subMenu.key"
              :index="subMenu.path"
            >
              <span>{{ subMenu.name }}</span>
            </el-menu-item>
          </el-sub-menu>
          <el-menu-item :index="menu.path" v-else>
            <img width="33" :src="menu.icon" />
            <template #title>
              <span class="ml-4">{{ menu.name }}</span>
            </template>
          </el-menu-item>
        </div>
      </el-menu>
    </div>
    <div class="aside-container--bottom-wrap mb-11 pl-6">
      <div class="user-box flex items-center">
        <el-popover :teleported="false" placement="right" trigger="click">
          <template #reference>
            <img :src="userAvatar" class="w-6" alt="" />
          </template>
          <el-button link @click="logout">退出登陆</el-button>
        </el-popover>
        <span class="user-name ml-5">{{ userName }}</span>
      </div>
      <img
        class="collapse-icon mt-7 w-6"
        :class="{ open: collapse }"
        src="@/assets/images/collapse.png"
        alt=""
        @click="collapse = !collapse"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { sysConfig } from '@/domain/SysConfig';
import { useRouter } from 'vue-router';

export default defineComponent({
  setup(props, ctx) {
    const collapse = ref(true);
    const router = useRouter();

    const navMenus = ref<any>({
      app: {
        path: '/about',
        icon: 'https://jtcospublic.ciccten.com/low-code/files/low-code-creator/file1695889943988.png',
        name: '应用管理ß',
      },
      home: {
        path: '/home',
        icon: 'https://jtcospublic.ciccten.com/low-code/files/low-code-creator/file1695889943988.png',
        name: '首页',
      },
    });

    const userAvatar = computed(() => {
      return sysConfig.user?.avatar || '@/assets/images/no-login.png';
    });

    const userName = computed(() => {
      return sysConfig.user?.name;
    });

    const title = computed(() => {
      return sysConfig.title || '';
    });

    async function logout() {
      let url = '/account/login/logout?jvAppId=';
      const jvCommon = sysConfig.jvCommon;
      if (jvCommon) {
        url = jvCommon?.main?.logoutUrl || '';
        url += '?jvAppId=' + jvCommon?.jvAppId;
      }
      window.location.replace(
        url + '&url=' + encodeURIComponent(location.href)
      );
    }

    function selectMenu(index: string) {
      router.push(index);
    }
    return {
      collapse,
      userAvatar,
      userName,
      title,
      navMenus,
      logout,
      selectMenu,
    };
  },
});
</script>

<style scoped lang="scss">
.aside-container {
  min-width: 260px;
  max-width: 260px;
  box-sizing: border-box;
  background: linear-gradient(343deg, #070709, #2f3137);
  &.collapse-wrap {
    max-width: 80px !important;
    min-width: 80px !important;
    .user-name,
    .logo-container--title {
      display: none;
    }
  }
  .logo-container {
    box-sizing: border-box;

    &--title {
      font-family: PingFang SC;
      font-size: 20px;
      font-weight: 500;
      line-height: 30px;
      color: var(--el-color-primary);
    }
  }
  &--bottom-wrap {
    .user-box {
      img {
        border-radius: 50%;
        border: 2px solid var(--el-color-primary);
      }
      .user-name {
        font-family: PingFang SC;
        font-size: 16px;
        font-weight: 500;
        line-height: 30px;
        color: var(--el-color-primary);
      }
    }
    .collapse-icon {
      &.open {
        transform: rotate(180deg);
      }
    }
  }

  ::v-deep(.el-menu) {
    border-right: none;

    .el-sub-menu__title,
    .el-menu-item {
      color: var(--el-color-primary);
      border-right: none;
      &.is-active {
        position: relative;
        &::before {
          content: '';
          width: 4px;
          background: var(--el-color-primary);
          display: block;
          height: 100%;
          position: absolute;
          left: 0;
        }
        background: linear-gradient(
          270deg,
          rgba(224, 180, 139, 0) 6%,
          rgba(247, 210, 171, 0.18)
        ) !important;
      }
    }
  }
}
</style>
