<template>
  <div class="entry-form-container">
    <form @submit.prevent="submitForm" class="entry-form">

      <!-- 収入/支出トグル -->
      <div class="type-toggle">
        <button
          type="button"
          :class="['toggle-btn', formData.type === '支出' ? 'active expense' : '']"
          @click="formData.type = '支出'"
        >支出</button>
        <button
          type="button"
          :class="['toggle-btn', formData.type === '収入' ? 'active income' : '']"
          @click="formData.type = '収入'"
        >収入</button>
      </div>

      <!-- 日付 -->
      <div class="form-group">
        <label for="date" class="form-label">日付</label>
        <input id="date" type="date" v-model="formData.date" class="form-control" required />
      </div>

      <!-- カテゴリ -->
      <div class="form-group">
        <label for="category" class="form-label">カテゴリ</label>
        <div class="input-with-list">
          <input
            id="category"
            type="text"
            v-model="formData.category"
            class="form-control"
            placeholder="例: 食費"
            list="category-list"
            required
            @change="onCategoryChange"
          />
          <datalist id="category-list">
            <option v-for="cat in categoryOptions" :key="cat" :value="cat" />
          </datalist>
        </div>
      </div>

      <!-- 小カテゴリ -->
      <div class="form-group">
        <label for="subcategory" class="form-label">小カテゴリ（任意）</label>
        <input
          id="subcategory"
          type="text"
          v-model="formData.subcategory"
          class="form-control"
          placeholder="例: 外食"
          list="subcategory-list"
        />
        <datalist id="subcategory-list">
          <option v-for="sub in subcategoryOptions" :key="sub" :value="sub" />
        </datalist>
      </div>

      <!-- 金額 -->
      <div class="form-group">
        <label for="amount" class="form-label">金額（円）</label>
        <input
          id="amount"
          type="number"
          v-model.number="formData.amount"
          class="form-control amount-input"
          :class="formData.type === '収入' ? 'income-input' : 'expense-input'"
          placeholder="0"
          min="0"
          step="1"
          required
        />
      </div>

      <!-- メモ -->
      <div class="form-group">
        <label for="memo" class="form-label">メモ（任意）</label>
        <textarea
          id="memo"
          v-model="formData.memo"
          rows="3"
          placeholder="自由入力"
          class="form-control"
        ></textarea>
      </div>

      <div v-if="error" class="error-message">{{ error }}</div>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary btn-submit" :disabled="isLoading">
          <span v-if="isLoading">保存中...</span>
          <span v-else>{{ isEditMode ? '更新する' : '登録する' }}</span>
        </button>
        <button
          v-if="isEditMode"
          type="button"
          class="btn btn-delete"
          :disabled="isLoading"
          @click="handleDelete"
        >
          <i class="fa-solid fa-trash"></i> この記録を削除する
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useEntries } from '../../composables/useEntries';
import { useCategorySettings } from '../../composables/useStoreSettings';
import { formatDateForAPI } from '../../utils/dateUtils';

const props = defineProps({
  entryId: { type: String, default: null }
});

const router = useRouter();
const { entries, addEntry, editEntry, removeEntry, isLoading, error } = useEntries();
const { getCategoriesForType, getSubcategoriesFor, addCustomSubcategory, addCustomCategory } = useCategorySettings();

const formData = ref({
  date: formatDateForAPI(new Date()),
  type: '支出',
  category: '',
  subcategory: '',
  amount: '',
  memo: '',
});

const isEditMode = computed(() => !!props.entryId);

// 選択中の種別に応じたカテゴリ一覧（システム固定 + カスタム）
const categoryOptions = computed(() => {
  const cats = getCategoriesForType(formData.value.type);
  return Object.keys(cats);
});

// 選択中カテゴリの小カテゴリ一覧
const subcategoryOptions = computed(() => {
  if (!formData.value.category) return [];
  return getSubcategoriesFor(formData.value.type, formData.value.category);
});

const onCategoryChange = () => {
  formData.value.subcategory = '';
};

const initForm = () => {
  if (props.entryId) {
    const existing = entries.value.find(e => e.id === props.entryId);
    if (existing) {
      formData.value = { ...existing };
      return;
    }
  }
  formData.value = {
    date: formatDateForAPI(new Date()),
    type: '支出',
    category: '',
    subcategory: '',
    amount: '',
    memo: '',
  };
};

onMounted(initForm);
watch(() => props.entryId, initForm);

const handleDelete = async () => {
  const entry = entries.value.find(e => e.id === props.entryId);
  const label = entry ? `${entry.date}の「${entry.category}」` : 'この記録';
  if (!window.confirm(`${label}を削除しますか？\n（この操作は元に戻せません）`)) return;
  try {
    await removeEntry(props.entryId);
    router.push({ name: 'List' });
  } catch (err) {
    alert('削除に失敗しました: ' + err.message);
  }
};

const submitForm = async () => {
  // 自由入力のカテゴリ・小カテゴリはカスタムに保存
  const type = formData.value.type;
  const category = formData.value.category;
  const subcategory = formData.value.subcategory;
  addCustomCategory(type, category);
  if (subcategory) addCustomSubcategory(type, category, subcategory);

  try {
    const entryData = {
      ...formData.value,
      amount: Number(formData.value.amount) || 0,
    };
    if (isEditMode.value) {
      await editEntry(props.entryId, entryData);
      router.push({ name: 'List' });
    } else {
      await addEntry(entryData);
      router.push({ name: 'Dashboard' });
    }
  } catch (err) {
    console.error('Registration/Update failed:', err);
  }
};
</script>

<style scoped>
.entry-form-container {
  max-width: 600px;
  margin: 0 auto;
  background-color: var(--bg-card-color);
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: var(--shadow-card);
  border: 1px solid var(--border-subtle);
}

@media (max-width: 480px) {
  .entry-form-container {
    padding: 1.25rem 1rem;
    border-radius: 0.75rem;
  }
}

.entry-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* 収入/支出トグル */
.type-toggle {
  display: flex;
  gap: 0;
  border-radius: 0.5rem;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.toggle-btn {
  flex: 1;
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  background: var(--overlay-1);
  color: var(--text-sub);
  transition: all 0.2s ease;
}

.toggle-btn.active.expense {
  background: var(--danger-color, #ef4444);
  color: #fff;
}

.toggle-btn.active.income {
  background: var(--success-color, #22c55e);
  color: #fff;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 500;
  color: var(--text-color, #e2e8f0);
}

.form-control {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid var(--border-color);
  background-color: var(--bg-input);
  color: var(--text-main);
  font-size: 1rem;
  transition: all 0.2s ease;
}

.form-control[type="date"]::-webkit-calendar-picker-indicator {
  filter: var(--picker-filter);
  cursor: pointer;
  opacity: 0.7;
}

.form-control:focus {
  outline: none;
  border-color: var(--primary-color, #10b981);
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
}

textarea.form-control {
  resize: vertical;
}

.amount-input {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 1.2rem;
}

.expense-input:focus {
  border-color: var(--danger-color, #ef4444);
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
}

.income-input:focus {
  border-color: var(--success-color, #22c55e);
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2);
}

.error-message {
  color: var(--danger-color, #ef4444);
  background-color: rgba(239, 68, 68, 0.1);
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.form-actions {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.btn {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 0.875rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary-color, #10b981), var(--secondary-color, #3b82f6));
  color: white;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.btn-delete {
  background: transparent;
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.4);
  font-size: 0.9rem;
  padding: 0.65rem 1.5rem;
}

.btn-delete:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.1);
  border-color: #ef4444;
}
</style>
