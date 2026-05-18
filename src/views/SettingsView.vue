<template>
  <div class="settings-view">
    <div class="page-header">
      <h1 class="page-title">{{ t('settings.title') }}</h1>
      <p class="page-subtitle">{{ t('settings.subtitle') }}</p>
    </div>

    <div class="settings-grid">
      <!-- Google アカウント -->
      <div class="card settings-card">
        <h3>{{ t('settings.accountTitle') }}</h3>
        <div v-if="user" class="account-info">
          <img :src="user.picture" alt="Profile" class="profile-pic" v-if="user.picture" />
          <div class="account-details">
            <div class="account-name">{{ user.name }}</div>
            <div class="account-email">{{ user.email }}</div>
          </div>
        </div>
        <div class="settings-actions mt-4">
          <button class="btn btn-danger" @click="handleLogout">
            <span class="icon">🚪</span> {{ t('settings.logout') }}
          </button>
        </div>
      </div>

      <!-- 言語設定 -->
      <div class="card settings-card">
        <h3>{{ t('settings.langTitle') }}</h3>
        <div class="form-group">
          <label class="form-label text-sm">{{ t('settings.langLabel') }}</label>
          <div class="lang-options">
            <button
              class="lang-btn"
              :class="{ active: currentLocale === 'ja' }"
              @click="changeLocale('ja')"
            >
              🇯🇵 {{ t('settings.langJa') }}
            </button>
            <button
              class="lang-btn"
              :class="{ active: currentLocale === 'en' }"
              @click="changeLocale('en')"
            >
              🇺🇸 {{ t('settings.langEn') }}
            </button>
          </div>
        </div>
      </div>

      <!-- カスタムカテゴリ -->
      <div class="card settings-card">
        <h3>{{ t('settings.customCatTitle') }}</h3>
        <p class="text-muted text-sm mb-4">{{ t('settings.customCatDesc') }}</p>

        <div class="category-form mb-4">
          <div class="form-group">
            <label class="form-label text-sm">{{ t('settings.catType') }}</label>
            <select v-model="newType" class="form-control">
              <option value="支出">{{ t('types.expense') }}</option>
              <option value="収入">{{ t('types.income') }}</option>
            </select>
          </div>
          <div class="form-group mt-2">
            <label class="form-label text-sm">{{ t('settings.catName') }}</label>
            <input type="text" v-model="newCategory" class="form-control" :placeholder="t('entry.categoryPlaceholder')" />
          </div>
          <div class="form-group mt-2">
            <label class="form-label text-sm">{{ t('settings.catSubname') }}</label>
            <input type="text" v-model="newSubcategory" class="form-control" :placeholder="t('entry.subcategoryPlaceholder')" />
          </div>
          <button
            class="btn btn-primary mt-3 w-100"
            @click="handleAddCustom"
            :disabled="!newCategory"
          >
            {{ t('settings.catAdd') }}
          </button>
        </div>

        <div class="custom-list-container">
          <h4 class="text-sm mb-2">{{ t('settings.catRegistered') }}</h4>
          <div v-for="(cats, type) in customCategories" :key="type">
            <div v-for="(subs, cat) in cats" :key="cat" class="custom-category-item">
              <div class="custom-cat-info">
                <span class="custom-type-badge" :class="type === '収入' ? 'badge-income' : 'badge-expense'">
                  {{ type === '収入' ? t('types.income') : t('types.expense') }}
                </span>
                <span class="custom-cat-name">{{ cat }}</span>
                <span v-if="subs.length > 0" class="custom-subs">{{ subs.join('、') }}</span>
              </div>
            </div>
          </div>
          <p v-if="Object.values(customCategories).every(t => Object.keys(t).length === 0)" class="text-muted text-sm text-center py-2">
            {{ t('settings.catEmpty') }}
          </p>
        </div>
      </div>

      <!-- データ管理 -->
      <div class="card settings-card">
        <h3>{{ t('settings.dataTitle') }}</h3>
        <p class="text-muted text-sm mb-4">{{ t('settings.dataDesc') }}</p>
        <div class="settings-actions">
          <button class="btn btn-primary" @click="handleSync" :disabled="isLoading">
            <span class="icon">🔄</span>
            {{ isLoading ? t('settings.syncing') : t('settings.sync') }}
          </button>
        </div>
        <p v-if="syncMessage" class="sync-message mt-2 text-sm text-success">
          {{ syncMessage }}
        </p>
      </div>

      <!-- アプリ情報 -->
      <div class="card settings-card">
        <h3>{{ t('settings.appInfoTitle') }}</h3>
        <ul class="app-info-list">
          <li><strong>{{ t('settings.appName') }}:</strong> MoneLog</li>
          <li><strong>{{ t('settings.appVersion') }}:</strong> 1.0.0</li>
          <li><strong>{{ t('settings.appEnv') }}:</strong> Vue 3 + Vite</li>
          <li><strong>{{ t('settings.appPWA') }}:</strong> 対応済み</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuth } from '@/composables/useAuth';
import { useEntries } from '@/composables/useEntries';
import { useCategorySettings } from '@/composables/useStoreSettings';
import { useLocale } from '@/composables/useLocale';

const router = useRouter();
const { t } = useI18n();
const { user, logout } = useAuth();
const { loadEntries, clearEntries, isLoading } = useEntries();
const { customCategories, addCustomCategory, addCustomSubcategory } = useCategorySettings();
const { locale, setLocale } = useLocale();

const currentLocale = computed(() => locale.value);

const syncMessage = ref('');
const newType = ref('支出');
const newCategory = ref('');
const newSubcategory = ref('');

const changeLocale = (lang) => {
  setLocale(lang);
};

const handleAddCustom = () => {
  if (!newCategory.value) return;
  addCustomCategory(newType.value, newCategory.value);
  if (newSubcategory.value) addCustomSubcategory(newType.value, newCategory.value, newSubcategory.value);
  newCategory.value = '';
  newSubcategory.value = '';
};

const handleLogout = () => {
  if (confirm(t('settings.logoutConfirm'))) {
    logout();
    clearEntries();
    router.push('/login');
  }
};

const handleSync = async () => {
  syncMessage.value = '';
  try {
    await loadEntries();
    syncMessage.value = t('settings.syncSuccess');
    setTimeout(() => { syncMessage.value = ''; }, 3000);
  } catch {
    alert(t('settings.syncError'));
  }
};
</script>

<style scoped>
.settings-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.settings-card {
  padding: 24px;
}

.settings-card h3 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 1.2rem;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 10px;
  color: var(--text-primary);
}

.account-info {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.profile-pic {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 2px solid var(--primary-color, #10b981);
}

.account-name { font-size: 1.1rem; font-weight: bold; color: var(--text-primary); }
.account-email { font-size: 0.9rem; color: var(--text-secondary); }

.lang-options {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}

.lang-btn {
  flex: 1;
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--overlay-1);
  color: var(--text-primary);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.lang-btn:hover {
  border-color: var(--accent-primary);
  background: rgba(var(--accent-primary-rgb), 0.08);
}

.lang-btn.active {
  border-color: var(--accent-primary);
  background: rgba(var(--accent-primary-rgb), 0.12);
  font-weight: 600;
}

.category-form {
  background-color: var(--overlay-1);
  padding: 16px;
  border-radius: 8px;
  border: 1px solid var(--border-subtle);
}

.custom-list-container { margin-top: 20px; }

.custom-category-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  background-color: var(--overlay-1);
  border-radius: 6px;
  border: 1px solid var(--border-subtle);
  margin-bottom: 6px;
}

.custom-cat-info { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

.custom-type-badge {
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 600;
}

.badge-expense { background: var(--color-lose-bg); color: var(--color-lose); border: 1px solid var(--color-lose-border); }
.badge-income  { background: var(--color-win-bg);  color: var(--color-win);  border: 1px solid var(--color-win-border); }

.custom-cat-name { font-weight: 500; color: var(--text-primary); }
.custom-subs { font-size: 0.85rem; color: var(--text-secondary); }

.app-info-list { list-style: none; padding: 0; margin: 0; }
.app-info-list li {
  padding: 10px 0;
  border-bottom: 1px solid var(--border-subtle);
  color: var(--text-secondary);
}
.app-info-list li:last-child { border-bottom: none; }
.app-info-list strong { color: var(--text-primary); margin-right: 8px; }

.settings-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.w-100 { width: 100%; }
.py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }

@media (min-width: 768px) {
  .settings-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
  .settings-grid > .settings-card:first-child {
    grid-column: span 2;
  }
}
</style>
