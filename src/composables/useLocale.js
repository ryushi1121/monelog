import { useI18n } from 'vue-i18n';

const STORAGE_KEY = 'monelog_locale';

export const getSavedLocale = () => localStorage.getItem(STORAGE_KEY);

export const saveLocale = (locale) => {
  localStorage.setItem(STORAGE_KEY, locale);
};

export const isLocaleSet = () => !!localStorage.getItem(STORAGE_KEY);

export const useLocale = () => {
  const { locale } = useI18n();

  const setLocale = (lang) => {
    locale.value = lang;
    saveLocale(lang);
  };

  return { locale, setLocale };
};

/** entry.type（日本語値）を t() で表示ラベルに変換するマップ */
export const TYPE_KEY_MAP = {
  '支出': 'types.expense',
  '収入': 'types.income',
  '貯金': 'types.savings',
  '投資': 'types.investment',
};
