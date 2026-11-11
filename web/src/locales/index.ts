/**
 * @file i18n 国际化插件
 * @description 基于 vue-i18n 实现多语言支持，默认中文
 * 
 * 初始化逻辑：
 * 1. 优先读取 localStorage 中的用户语言偏好
 * 2. 若无偏好，检测 navigator.language 系统语言
 * 3. 默认回退到 zh-CN
 */
import { createI18n } from 'vue-i18n';
import zhCN from './zh-CN';
import enUS from './en-US';

/** 支持的语言列表 */
export const SUPPORTED_LOCALES = ['zh-CN', 'en-US'] as const;
export type LocaleCode = (typeof SUPPORTED_LOCALES)[number];

/** 语言显示名称映射 */
export const LOCALE_LABELS: Record<LocaleCode, string> = {
  'zh-CN': '中文',
  'en-US': 'English',
};

/** localStorage 存储 key */
export const LOCALE_STORAGE_KEY = 'app-locale';

/**
 * 检测初始语言
 * 优先级：localStorage > navigator.language > zh-CN
 */
function detectLocale(): LocaleCode {
  // 1. 用户上次选择的语言
  const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (saved && SUPPORTED_LOCALES.includes(saved as LocaleCode)) {
    return saved as LocaleCode;
  }

  // 2. 系统语言检测
  const browserLang = navigator.language || (navigator as any).userLanguage;
  if (browserLang) {
    if (browserLang.startsWith('zh')) return 'zh-CN';
    if (browserLang.startsWith('en')) return 'en-US';
  }

  // 3. 默认中文
  return 'zh-CN';
}

/** 当前检测到的语言 */
export const defaultLocale = detectLocale();

/** vue-i18n 实例 */
export const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  locale: defaultLocale,
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS,
  },
});

/**
 * 获取当前生效的语言
 * @returns 当前语言代码
 */
export function getI18nLocale(): LocaleCode {
    // @ts-ignore - vue-i18n Composition API mode
    return i18n.global.locale.value as LocaleCode;
}

/**
 * 切换语言
 * @param locale - 目标语言代码
 */
export function setI18nLocale(locale: LocaleCode) {
  // @ts-ignore - vue-i18n Composition API mode
  i18n.global.locale.value = locale;
  localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  // 更新 HTML lang 属性
  document.documentElement.lang = locale;
}

// 初始化 HTML lang 属性
document.documentElement.lang = defaultLocale;
