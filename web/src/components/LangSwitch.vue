<template>
  <div class="lang-switch dropdown">
    <a
      href="#"
      class="lang-switch-btn nav-link dropdown-toggle"
      @click.prevent="isOpen = !isOpen"
    >
      <i class="bi bi-translate"></i>
      <span class="lang-label">{{ currentLabel }}</span>
    </a>
    <ul v-show="isOpen" class="dropdown-menu dropdown-menu-end show">
      <li v-for="item in availableLocales" :key="item.code">
        <a
          href="#"
          class="dropdown-item"
          :class="{ active: item.code === currentLocale }"
          @click.prevent="switchLang(item.code)"
        >
          {{ item.label }}
        </a>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useLocaleStore } from '@/stores/locale';
import type { LocaleCode } from '@/locales';

const localeStore = useLocaleStore();
const isOpen = ref(false);

const currentLocale = computed(() => localeStore.locale);
const currentLabel = computed(() => localeStore.currentLabel);
const availableLocales = computed(() => localeStore.availableLocales);

function switchLang(code: LocaleCode) {
  localeStore.setLocale(code);
  isOpen.value = false;
}

// 点击外部关闭
function handleClickOutside(e: MouseEvent) {
  const el = (e.target as HTMLElement)?.closest('.lang-switch');
  if (!el) isOpen.value = false;
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped lang="scss">
.lang-switch {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.lang-switch-btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.5rem;
  color: inherit;
  text-decoration: none;
  font-size: 0.875rem;
  cursor: pointer;
  border-radius: 0.25rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.06);
  }

  .lang-label {
    font-size: 0.8rem;
  }
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: 100%;
  min-width: 7rem;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 0.375rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 0.25rem 0;
  z-index: 1050;
  list-style: none;
  margin: 0;

  .dropdown-item {
    display: block;
    padding: 0.4rem 0.9rem;
    font-size: 0.875rem;
    color: #212529;
    text-decoration: none;
    cursor: pointer;

    &:hover {
      background-color: #f5f5f5;
    }

    &.active {
      color: #0d6efd;
      font-weight: 500;
    }
  }
}
</style>
