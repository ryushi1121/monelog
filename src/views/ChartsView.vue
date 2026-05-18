<template>
  <div class="charts-view">
    <div class="page-header">
      <h1 class="page-title">分析</h1>
      <p class="page-subtitle">明細の傾向・パターンを読む</p>
    </div>

    <PeriodSelector />

    <!-- 期間累積明細サマリー -->
    <div class="period-summary card mb-4">
      <span class="summary-label">{{ periodLabel }}の明細合計</span>
      <span class="summary-amount" :class="profitClass">
        {{ formattedProfit }}円
      </span>
      <span class="summary-count">{{ summaryStats.count }}件</span>
    </div>

    <div class="charts-grid">
      <TrendChart />
      <CategoryPieChart />
      <WeekdayChart />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useEntries } from '@/composables/useEntries';
import { useAnalytics } from '@/composables/useAnalytics';
import { formatProfit } from '@/utils/formatters';
import PeriodSelector from '@/components/analytics/PeriodSelector.vue';
import TrendChart from '@/components/charts/TrendChart.vue';
import WeekdayChart from '@/components/charts/WeekdayChart.vue';
import CategoryPieChart from '@/components/charts/CategoryPieChart.vue';

const { isLoaded, loadEntries } = useEntries();
const { selectedCategory, summaryStats, periodType, periodValue } = useAnalytics();

onMounted(() => {
  if (!isLoaded.value) loadEntries();
});

const periodLabel = computed(() => {
  let label = '';
  if (periodType.value === 'month' && periodValue.value) {
    const [y, m] = periodValue.value.split('-');
    label = `${y}年${parseInt(m)}月`;
  } else if (periodType.value === 'year' && periodValue.value) {
    label = `${periodValue.value}年`;
  } else {
    label = '全期間';
  }
  return selectedCategory.value ? `${label} / ${selectedCategory.value}` : label;
});

const formattedProfit = computed(() => formatProfit(summaryStats.value.net));
const profitClass = computed(() => {
  const p = summaryStats.value.net;
  if (p > 0) return 'text-success';
  if (p < 0) return 'text-danger';
  return '';
});
</script>

<style scoped>
.period-summary {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 20px;
  flex-wrap: wrap;
}
.summary-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}
.summary-amount {
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--text-primary);
}
.summary-count {
  color: var(--text-muted);
  font-size: 0.85rem;
  margin-left: auto;
}
.charts-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
@media (min-width: 1024px) {
  .charts-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: start;
  }
  .charts-grid > *:first-child {
    grid-column: span 2;
  }
}
</style>
