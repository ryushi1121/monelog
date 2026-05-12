import { ref, watch } from 'vue';
import { SYSTEM_CATEGORIES } from '../utils/categories';

const CATEGORY_SETTINGS_KEY = 'monelog_category_settings';

const loadSettings = () => {
  try {
    const stored = localStorage.getItem(CATEGORY_SETTINGS_KEY);
    return stored ? JSON.parse(stored) : { 支出: {}, 収入: {} };
  } catch {
    return { 支出: {}, 収入: {} };
  }
};

const customCategories = ref(loadSettings());

watch(customCategories, (val) => {
  localStorage.setItem(CATEGORY_SETTINGS_KEY, JSON.stringify(val));
}, { deep: true });

export const useCategorySettings = () => {
  // システム固定 + カスタムをマージしたカテゴリ一覧を返す
  const getCategoriesForType = (type) => {
    const system = SYSTEM_CATEGORIES[type] || {};
    const custom = customCategories.value[type] || {};
    const result = {};
    Object.entries(system).forEach(([cat, subs]) => {
      result[cat] = [...subs];
    });
    Object.entries(custom).forEach(([cat, subs]) => {
      if (result[cat]) {
        result[cat] = [...new Set([...result[cat], ...subs])];
      } else {
        result[cat] = [...subs];
      }
    });
    return result;
  };

  const getSubcategoriesFor = (type, category) => {
    const cats = getCategoriesForType(type);
    return cats[category] || [];
  };

  // 過去エントリの小カテゴリをカスタムに追記する（EntryForm から呼ぶ）
  const addCustomSubcategory = (type, category, subcategory) => {
    if (!subcategory) return;
    if (!customCategories.value[type]) customCategories.value[type] = {};
    const existing = customCategories.value[type][category] || [];
    if (!existing.includes(subcategory)) {
      customCategories.value[type][category] = [...existing, subcategory];
    }
  };

  const addCustomCategory = (type, category) => {
    if (!category) return;
    if (!customCategories.value[type]) customCategories.value[type] = {};
    if (!customCategories.value[type][category]) {
      customCategories.value[type][category] = [];
    }
  };

  return {
    customCategories,
    getCategoriesForType,
    getSubcategoriesFor,
    addCustomSubcategory,
    addCustomCategory,
  };
};
