import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Hindi translations
const hiTranslations = {
  nav: {
    findJobs: 'नौकरियां खोजें',
    companies: 'कंपनियां',
    dashboard: 'डैशबोर्ड',
    myJobs: 'मेरी नौकरियां',
    signIn: 'साइन इन करें',
    signUp: 'साइन अप करें',
  },
  home: {
    heroTitle: 'अपना अगला अवसर खोजें',
    heroSubtitle: 'शीर्ष कंपनियों से हज़ारों नौकरियां खोजें',
    searchPlaceholder: 'नौकरी का शीर्षक, कीवर्ड, या कंपनी',
    locationPlaceholder: 'शहर, राज्य या पिन कोड',
    searchButton: 'नौकरी खोजें',
  }
};

// English translations
const enTranslations = {
  nav: {
    findJobs: 'Find Jobs',
    companies: 'Companies',
    dashboard: 'Dashboard',
    myJobs: 'My Jobs',
    signIn: 'Sign In',
    signUp: 'Sign Up',
  },
  home: {
    heroTitle: 'Discover your next opportunity',
    heroSubtitle: 'Search thousands of jobs from top companies',
    searchPlaceholder: 'Job title, keywords, or company',
    locationPlaceholder: 'City, state, or zip code',
    searchButton: 'Search Jobs',
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations
      },
      hi: {
        translation: hiTranslations
      }
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
