import { ref, computed } from 'vue';
import { useCalendar } from './useCalendar';

const entries = ref([]);
const isLoading = ref(false);
const error = ref(null);
const isLoaded = ref(false);

export const useEntries = () => {
  const { fetchEntries: fetchApi, createEntry: createApi, updateEntry: updateApi, deleteEntry: deleteApi } = useCalendar();

  const loadEntries = async (timeMin = null, timeMax = null) => {
    isLoading.value = true;
    error.value = null;
    entries.value = [];
    try {
      const data = await fetchApi(timeMin, timeMax);
      entries.value = data;
      isLoaded.value = true;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const clearEntries = () => {
    entries.value = [];
    isLoaded.value = false;
  };

  const addEntry = async (entryData) => {
    isLoading.value = true;
    error.value = null;
    try {
      const newEntry = await createApi(entryData);
      entries.value.unshift(newEntry);
      entries.value.sort((a, b) => new Date(b.date) - new Date(a.date));
      return newEntry;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const editEntry = async (id, entryData) => {
    isLoading.value = true;
    error.value = null;
    try {
      const updatedEntry = await updateApi(id, entryData);
      const index = entries.value.findIndex(e => e.id === id);
      if (index !== -1) {
        entries.value[index] = updatedEntry;
        entries.value.sort((a, b) => new Date(b.date) - new Date(a.date));
      }
      return updatedEntry;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const removeEntry = async (id) => {
    isLoading.value = true;
    error.value = null;
    try {
      await deleteApi(id);
      entries.value = entries.value.filter(e => e.id !== id);
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const removeBulk = async (ids) => {
    isLoading.value = true;
    error.value = null;
    const succeeded = [];
    let failed = 0;
    try {
      for (let i = 0; i < ids.length; i++) {
        try {
          await deleteApi(ids[i]);
          succeeded.push(ids[i]);
        } catch {
          failed++;
        }
        if (i < ids.length - 1) await new Promise(r => setTimeout(r, 200));
      }
      entries.value = entries.value.filter(e => !succeeded.includes(e.id));
      if (failed > 0) throw new Error(`${failed}件の削除に失敗しました`);
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // 過去エントリから自由入力されたカテゴリを収集
  const suggestCategories = computed(() => {
    const cats = new Set();
    entries.value.forEach(e => { if (e.category) cats.add(e.category); });
    return Array.from(cats).sort();
  });

  // 過去エントリから小カテゴリをカテゴリ別に収集
  const suggestSubcategoriesFor = (category) => {
    const subs = new Set();
    entries.value.forEach(e => {
      if (e.category === category && e.subcategory) subs.add(e.subcategory);
    });
    return Array.from(subs).sort();
  };

  return {
    entries,
    isLoading,
    isLoaded,
    error,
    loadEntries,
    clearEntries,
    addEntry,
    editEntry,
    removeEntry,
    removeBulk,
    suggestCategories,
    suggestSubcategoriesFor,
  };
};
