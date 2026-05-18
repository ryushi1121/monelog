<template>
  <div class="dashboard-view">
    <div class="page-header">
      <div class="header-main">
        <h1 class="page-title">{{ t('dashboard.title') }}</h1>
        <p class="page-subtitle">{{ t('dashboard.subtitle', { period: displayPeriodStr }) }}</p>
      </div>

      <div class="dashboard-controls">
        <router-link to="/entry" class="btn btn-action register-btn">
          <i class="fa-solid fa-pen-to-square"></i> {{ t('dashboard.recordBtn') }}
        </router-link>

        <div class="view-mode-toggle">
          <label class="radio-label">
            <input type="radio" v-model="viewMode" value="month" @change="onPeriodChange" />
            {{ t('dashboard.monthTab') }}
          </label>
          <label class="radio-label">
            <input type="radio" v-model="viewMode" value="year" @change="onPeriodChange" />
            {{ t('dashboard.yearTab') }}
          </label>
        </div>

        <div class="period-navigation">
          <input
            v-if="viewMode === 'month'"
            type="month"
            v-model="selectedMonthStr"
            class="period-input"
          />
          <div v-else class="year-input-wrapper">
            <input
              type="number"
              v-model="selectedYearStr"
              class="period-input year-input"
              min="2000"
              max="2100"
            />
            <span v-if="locale === 'ja'" class="year-label">年</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>{{ t('common.loading') }}</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="forceReload" class="btn btn-outline">{{ t('common.retry') }}</button>
    </div>

    <div v-else class="dashboard-content">
      <div class="summary-cards">
        <SummaryCard
          :title="t('dashboard.income', { period: targetPeriodText })"
          :amount="currentPeriodStats.totalIncome"
          :subtitle="t('summaryCard.income')"
        />
        <SummaryCard
          :title="t('dashboard.expense', { period: targetPeriodText })"
          :amount="currentPeriodStats.totalExpense"
          :subtitle="t('summaryCard.expense')"
        />
        <SummaryCard
          :title="t('dashboard.savingsInvestment', { period: targetPeriodText })"
          :amount="currentPeriodStats.totalSavingsAndInvestment"
          :subtitle="t('summaryCard.savingsInvestment')"
        />
        <SummaryCard
          :title="t('dashboard.net', { period: targetPeriodText })"
          :amount="currentPeriodStats.net"
          :isProfit="true"
          :subtitle="t('summaryCard.net')"
        />
      </div>

      <div class="dashboard-grid">
        <QuickStats :entries="currentPeriodEntries" :title="t('quickStats.title') + ' — ' + targetPeriodText" class="grid-item" />
        <RecentHistory :entries="entries" :limit="5" class="grid-item" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useEntries } from '../composables/useEntries';
import SummaryCard from '../components/dashboard/SummaryCard.vue';
import QuickStats from '../components/dashboard/QuickStats.vue';
import RecentHistory from '../components/dashboard/RecentHistory.vue';

const { t, locale } = useI18n();
const { entries, isLoading, error, loadEntries, isLoaded } = useEntries();

const viewMode = ref('month');
const currentDate = ref(new Date());

const selectedMonthStr = computed({
  get: () => {
    const year = currentDate.value.getFullYear();
    const month = String(currentDate.value.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  },
  set: (val) => {
    if (val) {
      const [y, m] = val.split('-');
      currentDate.value = new Date(y, m - 1, 1);
    }
  }
});

const selectedYearStr = computed({
  get: () => currentDate.value.getFullYear(),
  set: (val) => {
    if (val) currentDate.value = new Date(val, 0, 1);
  }
});

const displayPeriodStr = computed(() => {
  if (locale.value === 'en') {
    const opts = viewMode.value === 'month'
      ? { year: 'numeric', month: 'long' }
      : { year: 'numeric' };
    return currentDate.value.toLocaleDateString('en-US', opts);
  }
  if (viewMode.value === 'month') {
    return `${currentDate.value.getFullYear()}年${currentDate.value.getMonth() + 1}月`;
  }
  return `${currentDate.value.getFullYear()}年`;
});

const targetPeriodText = computed(() => displayPeriodStr.value);

const currentPeriodEntries = computed(() => {
  const targetYear = currentDate.value.getFullYear();
  const targetMonth = String(currentDate.value.getMonth() + 1).padStart(2, '0');
  return entries.value.filter(e => {
    if (viewMode.value === 'month') return e.date.startsWith(`${targetYear}-${targetMonth}`);
    return e.date.startsWith(`${targetYear}`);
  });
});

const currentPeriodStats = computed(() => {
  let totalIncome = 0, totalExpense = 0, totalSavings = 0, totalInvestment = 0;
  currentPeriodEntries.value.forEach(e => {
    const amount = e.amount || 0;
    if (e.type === '収入')      totalIncome     += amount;
    else if (e.type === '貯金') totalSavings    += amount;
    else if (e.type === '投資') totalInvestment += amount;
    else                        totalExpense     += amount;
  });
  return {
    totalIncome, totalExpense, totalSavings, totalInvestment,
    totalSavingsAndInvestment: totalSavings + totalInvestment,
    net: totalIncome - totalExpense - totalSavings - totalInvestment,
  };
});

const onPeriodChange = () => {};

const forceReload = () => loadEntries();

onMounted(() => {
  if (!isLoaded.value) loadEntries();
});
</script>

<style scoped>
.btn-action {
  background: linear-gradient(135deg, #ff9a44 0%, #fc6076 100%);
  color: #ffffff;
  box-shadow: 0 4px 15px rgba(252, 96, 118, 0.4);
  border: none;
}

.btn-action:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(252, 96, 118, 0.6);
  color: #ffffff;
}

.dashboard-view {
  padding: 1rem;
  animation: fadeIn 0.3s ease-out;
}

.page-header {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

@media (min-width: 768px) {
  .page-header {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-end;
  }
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-color, #ffffff);
  margin-bottom: 0.5rem;
}

.page-subtitle {
  color: var(--text-sub);
  font-size: 0.95rem;
  margin: 0;
}

.dashboard-controls {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
}

@media (min-width: 768px) {
  .dashboard-controls {
    align-items: flex-end;
  }
}

.view-mode-toggle {
  display: flex;
  gap: 1.5rem;
  background-color: var(--overlay-1);
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: var(--text-color, #ffffff);
  font-size: 0.9rem;
}

.radio-label input[type="radio"] {
  accent-color: var(--primary-color, #00d4ff);
}

.period-navigation {
  display: flex;
  align-items: center;
  background-color: var(--bg-card-color, #16213e);
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  overflow: hidden;
}

.period-input {
  background: transparent;
  border: none;
  color: var(--text-color, #ffffff);
  padding: 0.5rem 1rem;
  font-size: 1rem;
  font-weight: 600;
  outline: none;
  font-family: inherit;
}

.period-input::-webkit-calendar-picker-indicator {
  filter: var(--picker-filter);
  cursor: pointer;
}

.year-input-wrapper {
  display: flex;
  align-items: center;
}

.year-input {
  width: 90px;
  padding-right: 0.25rem;
  text-align: center;
}

.year-label {
  color: var(--text-color, #ffffff);
  padding-right: 1rem;
  font-weight: 600;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

@media (max-width: 900px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  gap: 1rem;
  color: var(--text-sub);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-subtle);
  border-radius: 50%;
  border-top-color: var(--primary-color, #00d4ff);
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .dashboard-view {
    padding: 0.5rem;
  }
}
</style>
