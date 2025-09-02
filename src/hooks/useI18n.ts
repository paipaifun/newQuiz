import { useTranslation } from 'react-i18next';
import { commonStore } from '../stores/CommonStore';

export const useI18n = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (language: string) => {
    console.log('changeLanguage----', language);
    i18n.changeLanguage(language);
    if (commonStore && typeof commonStore.setLanguage === 'function') {
      commonStore.setLanguage(language);
    }
  };

  const getCurrentLanguage = () => {
    return i18n.language;
  };

  const isLanguage = (language: string) => {
    return i18n.language === language;
  };

  return {
    t,
    changeLanguage,
    getCurrentLanguage,
    isLanguage,
    language: i18n.language,
  };
}; 