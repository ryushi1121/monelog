<template>
  <div class="chart-container card mb-4">
    <div class="pie-header">
      <h3>
        支出カテゴリ構成
        <span v-if="selectedCategory" class="drilldown-label">— {{ selectedCategory }}</span>
      </h3>
      <button v-if="selectedCategory" class="back-btn" @click="clearCategory">
        ← 全カテゴリ
      </button>
    </div>
    <div class="chart-wrapper" v-if="hasData">
      <Doughnut :data="chartData" :options="chartOptions" />
    </div>
    <div v-else class="empty-state text-muted text-center py-4">データがありません</div>

    <!-- 小カテゴリ内訳リスト -->
    <div v-if="selectedCategory && rows.length > 0" class="sub-list">
      <table class="sub-table">
        <thead>
          <tr>
            <th>小カテゴリ</th>
            <th class="num">金額</th>
            <th class="num">割合</th>
            <th class="num">件数</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(row, i) in rows" :key="row.name">
            <tr
              class="sub-row"
              :class="{ 'is-selected': selectedSubcategory === row.name }"
              @click="toggleSubcategory(row.name)"
            >
              <td class="sub-name">
                <span class="color-dot" :style="{ background: PALETTE[i % PALETTE.length] }"></span>
                {{ row.name }}
                <span class="chevron">{{ selectedSubcategory === row.name ? '▲' : '▶' }}</span>
              </td>
              <td class="num expense">¥{{ row.totalExpense.toLocaleString() }}</td>
              <td class="num pct">{{ subExpenseRatio(row) }}%</td>
              <td class="num muted">{{ row.count }}</td>
            </tr>
            <tr
              v-for="entry in (selectedSubcategory === row.name ? subEntries : [])"
              :key="entry.id"
              class="entry-row"
            >
              <td class="entry-date">
                {{ formatDate(entry.date) }}<span class="entry-dow">{{ entry.dayOfWeek }}</span>
              </td>
              <td class="num entry-amount" :class="entry.type === '収入' ? 'income' : 'expense'">
                {{ entry.type === '収入' ? '+' : '-' }}¥{{ formatCurrency(entry.amount) }}
              </td>
              <td class="num"></td>
              <td class="entry-memo">{{ entry.memo || '—' }}</td>
            </tr>
          </template>
        </tbody>
        <tfoot>
          <tr class="sub-total">
            <td>合計</td>
            <td class="num expense">¥{{ grandSubExpense.toLocaleString() }}</td>
            <td class="num pct">100%</td>
            <td class="num muted">{{ subTotalCount }}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { Doughnut } from 'vue-chartjs';
import { useTheme } from '@/composables/useTheme';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { useAnalytics } from '@/composables/useAnalytics';
import { formatCurrency } from '@/utils/formatters';

ChartJS.register(ArcElement, Tooltip, Legend);

const { categoryStats, subcategoryStats, selectedCategory, setSelectedCategory, drilldownEntries } = useAnalytics();
const { theme } = useTheme();

const selectedSubcategory = ref('');
watch(selectedCategory, () => { selectedSubcategory.value = ''; });

const toggleSubcategory = (name) => {
  selectedSubcategory.value = selectedSubcategory.value === name ? '' : name;
};

const subEntries = computed(() => {
  if (!selectedSubcategory.value) return [];
  return drilldownEntries.value
    .filter(e => (e.subcategory || '分類なし') === selectedSubcategory.value)
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
});

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const [, m, d] = dateStr.split('-');
  return `${parseInt(m)}/${parseInt(d)}`;
};

const PALETTE = [
  '#ef4444','#f97316','#eab308','#22c55e','#06b6d4',
  '#3b82f6','#8b5cf6','#ec4899','#14b8a6','#f59e0b',
  '#84cc16','#6366f1','#a855f7'
];

// カテゴリ選択中は小カテゴリ、未選択は大カテゴリを表示
const rows = computed(() => {
  if (selectedCategory.value) {
    return subcategoryStats.value.filter(r => r.totalExpense > 0).slice(0, 12);
  }
  return categoryStats.value.filter(r => r.totalExpense > 0).slice(0, 12);
});

const hasData = computed(() => rows.value.length > 0);

const clearCategory = () => setSelectedCategory(selectedCategory.value);
const chartCursor = computed(() => selectedCategory.value ? 'default' : 'pointer');

const grandSubExpense = computed(() => rows.value.reduce((s, r) => s + r.totalExpense, 0));
const subTotalCount   = computed(() => rows.value.reduce((s, r) => s + r.count, 0));
const subExpenseRatio = (row) => {
  if (!grandSubExpense.value) return 0;
  return Math.round((row.totalExpense / grandSubExpense.value) * 100);
};

const cc = computed(() => ({
  textSub: theme.value === 'light' ? '#657b83' : '#839496',
  border: theme.value === 'light' ? '#ffffff' : '#1e293b',
}));

const chartData = computed(() => ({
  labels: rows.value.map(r => r.name),
  datasets: [{
    data: rows.value.map(r => r.totalExpense),
    backgroundColor: rows.value.map((_, i) => PALETTE[i % PALETTE.length]),
    borderColor: cc.value.border,
    borderWidth: 2,
    hoverOffset: 6
  }]
}));

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: '60%',
  // 大カテゴリ表示中のみスライスクリックでドリルダウン
  onClick: selectedCategory.value ? undefined : (_, elements) => {
    if (elements.length > 0) {
      const name = rows.value[elements[0].index]?.name;
      if (name) setSelectedCategory(name);
    }
  },
  plugins: {
    legend: {
      position: 'right',
      labels: {
        color: cc.value.textSub,
        font: { size: 11 },
        padding: 10,
        boxWidth: 12
      }
    },
    tooltip: {
      callbacks: {
        label: (ctx) => {
          const val = ctx.parsed;
          const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
          const pct = total ? Math.round((val / total) * 100) : 0;
          return ` ${ctx.label}: ¥${val.toLocaleString()} (${pct}%)`;
        }
      }
    }
  }
}));
</script>

<style scoped>
.pie-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}

.pie-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.drilldown-label {
  color: var(--accent-primary);
  font-weight: 500;
}

.back-btn {
  font-size: 0.8rem;
  padding: 3px 10px;
  border-radius: 20px;
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.back-btn:hover {
  background: var(--surface-hover);
  color: var(--text-primary);
}

.chart-wrapper {
  position: relative;
  width: 100%;
  height: 300px;
  overflow: hidden;
  margin-top: 10px;
  cursor: v-bind(chartCursor);
}

@media (max-width: 600px) {
  .chart-wrapper { height: 240px; }
}

/* 小カテゴリ内訳リスト */
.sub-list {
  border-top: 1px solid var(--border-subtle);
  margin-top: 4px;
}

.sub-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.sub-table th {
  text-align: left;
  padding: 7px 12px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-faded);
  background: var(--overlay-1);
  border-bottom: 1px solid var(--border-subtle);
}

.sub-table th.num,
.sub-table td.num { text-align: right; }

.sub-table tbody tr {
  border-bottom: 1px solid var(--border-subtle);
}

.sub-table tbody tr:hover { background: var(--surface-hover); }

.sub-table td {
  padding: 8px 12px;
  color: var(--text-main);
  font-variant-numeric: tabular-nums;
}

.sub-name {
  display: flex;
  align-items: center;
  gap: 7px;
  font-weight: 500;
}

.color-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.expense { color: var(--danger-color); }
.pct { color: var(--text-faded); min-width: 44px; }
.muted { color: var(--text-faded); }

.sub-total {
  background: var(--overlay-2);
  border-top: 2px solid var(--border-color);
}
.sub-total td {
  font-weight: 700;
  color: var(--text-main);
  padding: 9px 12px;
}

.sub-row { cursor: pointer; transition: background 0.12s; }
.sub-row:hover { background: var(--surface-hover); }
.sub-row.is-selected { background: rgba(var(--accent-primary-rgb), 0.08); }

.chevron {
  margin-left: auto;
  font-size: 0.65rem;
  color: var(--text-faded);
}

.entry-row {
  background: var(--overlay-1);
  border-bottom: 1px solid var(--border-subtle);
}
.entry-row:hover { background: var(--surface-hover); }

.entry-date {
  padding: 6px 12px 6px 28px;
  font-size: 0.8rem;
  color: var(--text-sub);
  white-space: nowrap;
}
.entry-dow {
  margin-left: 3px;
  font-size: 0.72rem;
  color: var(--text-faded);
}
.entry-amount {
  font-size: 0.85rem;
  font-weight: 600;
}
.entry-memo {
  font-size: 0.8rem;
  color: var(--text-sub);
  padding: 6px 12px;
}
.income { color: var(--success-color); }
</style>
