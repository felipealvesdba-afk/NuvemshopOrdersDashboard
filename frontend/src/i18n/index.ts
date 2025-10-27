import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enTranslations from '../locales/en.json';
import ptTranslations from '../locales/pt.json';

const resources = {
  en: {
    translation: enTranslations
  },
  pt: {
    translation: ptTranslations
  }
};

// Initialize i18n
const initI18n = () => {
  return i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: 'en',
      debug: false, // Disable debug mode for production
      
      detection: {
        order: ['localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage'],
      },

      interpolation: {
        escapeValue: false, // React already does escaping
      },

      react: {
        useSuspense: false,
      }
    });
};

// Initialize immediately
initI18n();

export default i18n;
