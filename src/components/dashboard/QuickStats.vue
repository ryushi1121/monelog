<template>
  <div class="quick-stats card">
    <h3 class="card-title">{{ title || '明細サマリー' }}</h3>
    <div class="stats-grid">
      <div class="stat-item">
        <div class="stat-label">記録件数</div>
        <div class="stat-value">{{ count }} <span class="unit">件</span></div>
      </div>
      <div class="stat-item">
        <div class="stat-label">記録日数</div>
        <div class="stat-value">{{ recordDays }} <span class="unit">日</span></div>
      </div>
      <div class="stat-item">
        <div class="stat-label">日平均支出</div>
        <div class="stat-value expense">{{ recordDays > 0 ? formatCurrency(Math.round(totalExpense / recordDays)) : '—' }}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">最大1件支出</div>
        <div class="stat-value expense">{{ maxExpense > 0 ? formatCurrency(maxExpense) : '—' }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { formatCurrency } from '../../utils/formatters';

const props = defineProps({
  entries: { type: Array, required: true },
  title: { type: String, default: '明細サマリー' },
});

const count = computed(() => props.entries.length);

const recordDays = computed(() => {
  const dates = new Set(props.entries.map(e => e.date));
  return dates.size;
});

const totalExpense = computed(() =>
  props.entries.filter(e => e.type === '支出').reduce((sum, e) => sum + (e.amount || 0), 0)
);

const maxExpense = computed(() => {
  const expenses = props.entries.filter(e => e.type === '支出').map(e => e.amount || 0);
  return expenses.length > 0 ? Math.max(...expenses) : 0;
});
</script>

<style scoped>
.card {
  background-color: var(--bg-card-color, #16213e);
  border-radius: 1rem;
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-card);
  padding: 1.5rem;
}

.card-title {
  margin: 0 0 1.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-color, #ffffff);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-label {
  font-size: 0.85rem;
  color: var(--text-sub);
}

.stat-value {
  font-size: 1.4rem;
  font-weight: 700;
  font-family: 'Inter', sans-serif;
  color: var(--text-color, #ffffff);
}

.unit {
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-sub);
}

.stat-value.expense { color: var(--danger-color, #ef4444); }

@media (max-width: 480px) {
  .card { padding: 1rem; }
  .stats-grid { grid-template-columns: 1fr; gap: 1rem; }
}
</style>
