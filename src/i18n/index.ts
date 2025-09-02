import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { commonStore } from '../stores/CommonStore';

// 导入语言包
import en from './langs/en/locale.json'
import fr from './langs/fr/locale.json'
import ar from './langs/ar/locale.json'
import de from './langs/de/locale.json'
import es from './langs/es/locale.json'
// import id from './langs/id/locale.json'
// import pl from './langs/pl/locale.json'
import pt from './langs/pt/locale.json'
import th from './langs/th/locale.json'
import vi from './langs/vi/locale.json'
import ja from './langs/ja/locale.json'
import zh from './langs/zh-tw/locale.json';

const resources = {
  en: {
    translation: en,
  },
  fr: {
    translation: fr,
  },
  ar: {
    translation: ar,
  },
  de: {
    translation: de,
  },
  es: {
    translation: es,
  },
  pt: {
    translation: pt,
  },
  th: {
    translation: th,
  },
  vi: {
    translation: vi,
  },
  ja: {
    translation: ja,
  },
  'zh-TW': { translation: zh },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en', // 默认语言
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false, // React 已经处理了 XSS
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    // supportedLngs: ['en', 'fr', 'ar', 'de', 'es', 'id', 'pl', 'pt', 'th', 'vi', 'zh-TW','ja'],
  });

  // commonStore.setLanguage(i18n.language ? i18n.language : 'en');


export default i18n; 