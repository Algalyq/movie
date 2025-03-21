import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './translations/en.json';
import ru from './translations/ru.json';
import kk from './translations/kk.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ru: { translation: ru },
      kk: { translation: kk },
    },
    lng: 'kk', // default language
    fallbackLng: 'kk',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
