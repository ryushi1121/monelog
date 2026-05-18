<template>
  <div class="period-selector card mb-4">
    <div class="selector-row">
      <div class="period-tabs">
        <button :class="{ active: periodType === 'all' }" @click="setPeriod('all')">{{ t('period.all') }}</button>
        <button :class="{ active: periodType === 'year' }" @click="setPeriod('year')">{{ t('period.year') }}</button>
        <button :class="{ active: periodType === 'month' }" @click="setPeriod('month')">{{ t('period.month') }}</button>
      </div>

      <div class="period-inputs" v-if="periodType !== 'all'">
        <input
          v-if="periodType === 'month'"
          type="month"
          v-model="periodValue"
        >
        <select
          v-if="periodType === 'year'"
          v-model="periodValue"
        >
          <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
        </select>
      </div>
    </div>

    <div class="selector-row type-row">
      <label class="cat-label">{{ t('filter.type') }}</label>
      <div class="type-tabs">
        <button
          v-for="opt in typeOptions"
          :key="opt.value"
          :class="['type-tab', { active: selectedType === opt.value }, opt.cls]"
          @click="selectedType = opt.value"
        >{{ opt.label }}</button>
      </div>
    </div>

    <div class="selector-row cat-row" v-if="availableCategories.length > 0">
      <label class="cat-label">{{ t('filter.category') }}</label>
      <select v-model="categoryModel" class="cat-select">
        <option value="">{{ t('filter.allCategories') }}</option>
        <option v-for="cat in availableCategories" :key="cat" :value="cat">{{ t(`sysCategories.${cat}`, cat) }}</option>
      </select>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAnalytics } from '@/composables/useAnalytics';
import { useEntries } from '@/composables/useEntries';

const { t } = useI18n();
const { periodType, periodValue, selectedCategory, selectedType, availableCategories } = useAnalytics();

const typeOptions = computed(() => [
  { label: t('typeAll'),           value: '',    cls: 'tab-all' },
  { label: t('types.expense'),     value: '支出', cls: 'tab-expense' },
  { label: t('types.income'),      value: '収入', cls: 'tab-income' },
  { label: t('types.savings'),     value: '貯金', cls: 'tab-savings' },
  { label: t('types.investment'),  value: '投資', cls: 'tab-investment' },
]);

const { entries } = useEntries();

const categoryModel = computed({
  get: () => selectedCategory.value,
  set: (val) => { selectedCategory.value = val; }
});

const availableYears = computed(() => {
  const years = new Set();
  entries.value.forEach(e => {
    if (e.date) years.add(e.date.substring(0, 4));
  });
  const arr = Array.from(years).sort().reverse();
  return arr.length > 0 ? arr : [new Date().getFullYear().toString()];
});

const setPeriod = (type) => {
  periodType.value = type;
  if (type === 'month') {
    periodValue.value = new Date().toISOString().substring(0, 7);
  } else if (type === 'year') {
    periodValue.value = availableYears.value[0];
  } else {
    periodValue.value = null;
  }
};

watch(selectedType, () => { selectedCategory.value = ''; });

onMounted(() => {
  if (periodType.value === 'month' && !periodValue.value) {
    periodValue.value = new Date().toISOString().substring(0, 7);
  } else if (periodType.value === 'year' && !periodValue.value) {
    periodValue.value = availableYears.value[0];
  }
});
</script>

<style scoped>
.period-selector {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 15px 20px;
}
.selector-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}
.period-tabs {
  display: flex;
  gap: 10px;
}
.period-tabs button {
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-main);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}
.period-tabs button:hover { background: var(--surface-hover); }
.period-tabs button.active {
  background: var(--accent-primary);
  color: var(--text-inverse);
  border-color: var(--accent-primary);
  font-weight: bold;
}
.period-inputs input,
.period-inputs select {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-input);
  color: var(--text-main);
  font-size: 0.95rem;
  outline: none;
}
.period-inputs input:focus,
.period-inputs select:focus { border-color: var(--accent-primary); }
.period-inputs select option { background: var(--bg-input); color: var(--text-main); }
.period-inputs input[type="month"]::-webkit-calendar-picker-indicator {
  filter: var(--picker-filter);
  cursor: pointer;
  opacity: 0.8;
}
.type-row {
  border-top: 1px solid var(--border-subtle);
  padding-top: 10px;
}
.cat-row {
  border-top: 1px solid var(--border-subtle);
  padding-top: 10px;
}
.cat-label {
  font-size: 0.85rem;
  color: var(--text-sub);
  white-space: nowrap;
}
.cat-select {
  padding: 7px 12px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-input);
  color: var(--text-main);
  font-size: 0.9rem;
  outline: none;
  min-width: 160px;
}
.cat-select:focus { border-color: var(--accent-primary); }
.cat-select option { background: var(--bg-input); color: var(--text-main); }

.type-tabs {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.type-tab {
  padding: 5px 14px;
  border-radius: 20px;
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-sub);
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}
.type-tab:hover { background: var(--surface-hover); }

.type-tab.tab-expense.active    { background: var(--danger-color);  color: #fff; border-color: var(--danger-color); }
.type-tab.tab-income.active     { background: var(--success-color); color: #fff; border-color: var(--success-color); }
.type-tab.tab-savings.active    { background: #eab308; color: #fff; border-color: #eab308; }
.type-tab.tab-investment.active { background: #3b82f6; color: #fff; border-color: #3b82f6; }
.type-tab.tab-all.active        { background: var(--accent-primary); color: var(--text-inverse); border-color: var(--accent-primary); font-weight: bold; }
</style>
