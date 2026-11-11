/**
 * @file 语言状态管理
 * @description 使用 Pinia 管理应用语言偏好，持久化到 localStorage
 */
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import {
  getI18nLocale,
  setI18nLocale,
  SUPPORTED_LOCALES,
  LOCALE_LABELS,
  type LocaleCode,
} from '@/locales';

/**
 * 语言状态 Store
 * @use const localeStore = useLocaleStore()
 */
export const useLocaleStore = defineStore('locale', () => {
  /**
   * 当前生效的语言。
   *
   * 不能直接用 locales/index.ts 的 `defaultLocale`：那是「页面加载时检测到的语言」，
   * 运行期切换后不会变（computed 恒返回它），导致语言选择器显示的当前项始终不变。
   * 这里以 i18n 实例里的真实值为准，并在 setI18nLocale 后同步。
   */
  const current = ref<LocaleCode>(getI18nLocale());

  /** 当前语言（可写：赋值即切换语言） */
  const locale = computed<LocaleCode>({
    get: () => current.value,
    set: (val: LocaleCode) => {
      setLocale(val);
    },
  });

  /** 当前语言的显示名称 */
  const currentLabel = computed(() => LOCALE_LABELS[current.value] || '中文');

  /** 支持的语言列表（含 label） */
  const availableLocales = SUPPORTED_LOCALES.map((code) => ({
    code,
    label: LOCALE_LABELS[code],
  }));

  /**
   * 切换语言
   * @param code - 目标语言代码
   */
  function setLocale(code: LocaleCode) {
    if (!SUPPORTED_LOCALES.includes(code)) return;
    setI18nLocale(code);
    current.value = code;
  }

  return {
    locale,
    currentLabel,
    availableLocales,
    setLocale,
  };
});
