<template>
  <div class="category-analytics card mb-4">
    <div class="ca-header">
      <h3>カテゴリ別集計</h3>
      <span v-if="selectedCategory" class="ca-drilldown-badge" @click="clearCategory">
        {{ selectedCategory }} ✕
      </span>
    </div>

    <div v-if="categoryStats.length === 0" class="empty-state text-muted text-center py-4">
      データがありません
    </div>

    <template v-else>
      <!-- 支出セクション -->
      <div v-if="expenseCategories.length > 0" class="ca-section">
        <div class="section-label expense-label">支出</div>
        <table class="ca-table">
          <thead>
            <tr>
              <th>カテゴリ</th>
              <th class="num">金額</th>
              <th class="num pc">割合</th>
              <th class="num">件数</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in expenseCategories"
              :key="row.name"
              class="ca-row"
              :class="{ 'is-selected': selectedCategory === row.name }"
              @click="setSelectedCategory(row.name)"
            >
              <td class="ca-name">{{ row.name }}</td>
              <td class="num expense">{{ formatCurrency(row.totalExpense) }}</td>
              <td class="num pc">
                <div class="bar-wrap">
                  <div class="bar-fill expense-bar" :style="{ width: expenseRatio(row) + '%' }"></div>
                  <span class="bar-label">{{ expenseRatio(row) }}%</span>
                </div>
              </td>
              <td class="num muted">{{ row.count }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="ca-total">
              <td>合計</td>
              <td class="num expense">{{ formatCurrency(expenseTotalAmount) }}</td>
              <td class="num pc"></td>
              <td class="num muted">{{ expenseTotalCount }}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- 貯金セクション -->
      <div v-if="savingsCategories.length > 0" class="ca-section savings-section">
        <div class="section-label savings-label">貯金</div>
        <table class="ca-table">
          <thead>
            <tr>
              <th>カテゴリ</th>
              <th class="num">金額</th>
              <th class="num pc">割合</th>
              <th class="num">件数</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in savingsCategories"
              :key="row.name"
              class="ca-row"
              :class="{ 'is-selected': selectedCategory === row.name }"
              @click="setSelectedCategory(row.name)"
            >
              <td class="ca-name">{{ row.name }}</td>
              <td class="num savings">{{ formatCurrency(row.totalSavings) }}</td>
              <td class="num pc">
                <div class="bar-wrap">
                  <div class="bar-fill savings-bar" :style="{ width: savingsRatio(row) + '%' }"></div>
                  <span class="bar-label">{{ savingsRatio(row) }}%</span>
                </div>
              </td>
              <td class="num muted">{{ row.count }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="ca-total">
              <td>合計</td>
              <td class="num savings">{{ formatCurrency(savingsTotalAmount) }}</td>
              <td class="num pc"></td>
              <td class="num muted">{{ savingsTotalCount }}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- 投資セクション -->
      <div v-if="investmentCategories.length > 0" class="ca-section investment-section">
        <div class="section-label investment-label">投資</div>
        <table class="ca-table">
          <thead>
            <tr>
              <th>カテゴリ</th>
              <th class="num">金額</th>
              <th class="num pc">割合</th>
              <th class="num">件数</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in investmentCategories"
              :key="row.name"
              class="ca-row"
              :class="{ 'is-selected': selectedCategory === row.name }"
              @click="setSelectedCategory(row.name)"
            >
              <td class="ca-name">{{ row.name }}</td>
              <td class="num investment">{{ formatCurrency(row.totalInvestment) }}</td>
              <td class="num pc">
                <div class="bar-wrap">
                  <div class="bar-fill investment-bar" :style="{ width: investmentRatio(row) + '%' }"></div>
                  <span class="bar-label">{{ investmentRatio(row) }}%</span>
                </div>
              </td>
              <td class="num muted">{{ row.count }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="ca-total">
              <td>合計</td>
              <td class="num investment">{{ formatCurrency(investmentTotalAmount) }}</td>
              <td class="num pc"></td>
              <td class="num muted">{{ investmentTotalCount }}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- 収入セクション -->
      <div v-if="incomeCategories.length > 0" class="ca-section income-section">
        <div class="section-label income-label">収入</div>
        <table class="ca-table">
          <thead>
            <tr>
              <th>カテゴリ</th>
              <th class="num">金額</th>
              <th class="num pc">割合</th>
              <th class="num">件数</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in incomeCategories"
              :key="row.name"
              class="ca-row"
              :class="{ 'is-selected': selectedCategory === row.name }"
              @click="setSelectedCategory(row.name)"
            >
              <td class="ca-name">{{ row.name }}</td>
              <td class="num income">{{ formatCurrency(row.totalIncome) }}</td>
              <td class="num pc">
                <div class="bar-wrap">
                  <div class="bar-fill income-bar" :style="{ width: incomeRatio(row) + '%' }"></div>
                  <span class="bar-label">{{ incomeRatio(row) }}%</span>
                </div>
              </td>
              <td class="num muted">{{ row.count }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="ca-total">
              <td>合計</td>
              <td class="num income">{{ formatCurrency(incomeTotalAmount) }}</td>
              <td class="num pc"></td>
              <td class="num muted">{{ incomeTotalCount }}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <!-- 明細サマリー行 -->
      <div class="ca-summary">
        <span class="summary-item">
          <span class="summary-label">支出</span>
          <span class="summary-value expense">-¥{{ formatCurrency(expenseTotalAmount) }}</span>
        </span>
        <span v-if="savingsTotalAmount > 0" class="summary-sep">／</span>
        <span v-if="savingsTotalAmount > 0" class="summary-item">
          <span class="summary-label">貯金</span>
          <span class="summary-value savings">-¥{{ formatCurrency(savingsTotalAmount) }}</span>
        </span>
        <span v-if="investmentTotalAmount > 0" class="summary-sep">／</span>
        <span v-if="investmentTotalAmount > 0" class="summary-item">
          <span class="summary-label">投資</span>
          <span class="summary-value investment">-¥{{ formatCurrency(investmentTotalAmount) }}</span>
        </span>
        <span class="summary-sep">／</span>
        <span class="summary-item">
          <span class="summary-label">収入</span>
          <span class="summary-value income">+¥{{ formatCurrency(incomeTotalAmount) }}</span>
        </span>
        <span class="summary-sep">／</span>
        <span class="summary-item">
          <span class="summary-label">純残高</span>
          <span class="summary-value" :class="netAmount >= 0 ? 'positive' : 'negative'">
            {{ netAmount >= 0 ? '+' : '' }}¥{{ formatCurrency(netAmount) }}
          </span>
        </span>
      </div>
    </template>

    <!-- サブカテゴリ展開 -->
    <div v-if="selectedCategory && subcategoryStats.length > 0" class="sub-section">
      <h4 class="sub-title">{{ selectedCategory }} — 小カテゴリ別</h4>
      <table class="ca-table">
        <thead>
          <tr>
            <th>小カテゴリ</th>
            <th class="num">支出</th>
            <th class="num">収入</th>
            <th class="num">明細</th>
            <th class="num">件数</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="row in subcategoryStats" :key="row.name">
            <tr
              class="ca-row"
              :class="{ 'is-selected': selectedSubcategory === row.name }"
              @click="toggleSubcategory(row.name)"
            >
              <td class="ca-name">
                {{ row.name }}
                <span class="chevron">{{ selectedSubcategory === row.name ? '▲' : '▶' }}</span>
              </td>
              <td class="num expense">{{ row.totalExpense > 0 ? formatCurrency(row.totalExpense) : '—' }}</td>
              <td class="num income">{{ row.totalIncome > 0 ? formatCurrency(row.totalIncome) : '—' }}</td>
              <td class="num" :class="row.net >= 0 ? 'positive' : 'negative'">
                {{ row.net >= 0 ? '+' : '' }}{{ formatCurrency(row.net) }}
              </td>
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
              <td class="num entry-amount expense" v-if="entry.type !== '収入'">-¥{{ formatCurrency(entry.amount) }}</td>
              <td class="num entry-amount income"  v-else>+¥{{ formatCurrency(entry.amount) }}</td>
              <td></td>
              <td></td>
              <td class="entry-memo">{{ entry.memo || '—' }}</td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useAnalytics } from '@/composables/useAnalytics';
import { formatCurrency } from '@/utils/formatters';

const { categoryStats, subcategoryStats, selectedCategory, setSelectedCategory, summaryStats, drilldownEntries } = useAnalytics();

const expenseCategories = computed(() =>
  categoryStats.value.filter(r => r.totalExpense > 0)
);
const incomeCategories = computed(() =>
  categoryStats.value.filter(r => r.totalIncome > 0)
    .sort((a, b) => b.totalIncome - a.totalIncome)
);
const savingsCategories = computed(() =>
  categoryStats.value.filter(r => r.totalSavings > 0)
    .sort((a, b) => b.totalSavings - a.totalSavings)
);
const investmentCategories = computed(() =>
  categoryStats.value.filter(r => r.totalInvestment > 0)
    .sort((a, b) => b.totalInvestment - a.totalInvestment)
);

const expenseTotalAmount    = computed(() => expenseCategories.value.reduce((s, r) => s + r.totalExpense, 0));
const incomeTotalAmount     = computed(() => incomeCategories.value.reduce((s, r) => s + r.totalIncome, 0));
const savingsTotalAmount    = computed(() => savingsCategories.value.reduce((s, r) => s + r.totalSavings, 0));
const investmentTotalAmount = computed(() => investmentCategories.value.reduce((s, r) => s + r.totalInvestment, 0));
const expenseTotalCount     = computed(() => expenseCategories.value.reduce((s, r) => s + r.count, 0));
const incomeTotalCount      = computed(() => incomeCategories.value.reduce((s, r) => s + r.count, 0));
const savingsTotalCount     = computed(() => savingsCategories.value.reduce((s, r) => s + r.count, 0));
const investmentTotalCount  = computed(() => investmentCategories.value.reduce((s, r) => s + r.count, 0));
const netAmount             = computed(() =>
  incomeTotalAmount.value - expenseTotalAmount.value - savingsTotalAmount.value - investmentTotalAmount.value
);

const expenseRatio = (row) => {
  if (!expenseTotalAmount.value) return 0;
  return Math.round((row.totalExpense / expenseTotalAmount.value) * 100);
};

const savingsRatio = (row) => {
  if (!savingsTotalAmount.value) return 0;
  return Math.round((row.totalSavings / savingsTotalAmount.value) * 100);
};

const investmentRatio = (row) => {
  if (!investmentTotalAmount.value) return 0;
  return Math.round((row.totalInvestment / investmentTotalAmount.value) * 100);
};

const incomeRatio = (row) => {
  if (!incomeTotalAmount.value) return 0;
  return Math.round((row.totalIncome / incomeTotalAmount.value) * 100);
};

const clearCategory = () => setSelectedCategory(selectedCategory.value);

// サブカテゴリ → 明細ドリルダウン
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
</script>

<style scoped>
.category-analytics {
  overflow: hidden;
}
.ca-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px 10px;
  border-bottom: 1px solid var(--border-subtle);
}
.ca-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}
.ca-drilldown-badge {
  background: rgba(var(--accent-primary-rgb), 0.15);
  color: var(--accent-primary);
  border: 1px solid rgba(var(--accent-primary-rgb), 0.3);
  border-radius: 20px;
  padding: 2px 10px;
  font-size: 0.78rem;
  cursor: pointer;
  user-select: none;
}
.ca-drilldown-badge:hover { opacity: 0.75; }

.ca-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  table-layout: fixed;
}
.ca-table th:first-child,
.ca-table td:first-child { width: auto; }
.ca-table th.num:not(.pc),
.ca-table td.num:not(.pc) { width: 90px; }
.ca-table th.pc,
.ca-table td.pc { width: 90px; }
.ca-table th {
  text-align: left;
  padding: 8px 12px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-faded);
  background: var(--overlay-1);
  border-bottom: 1px solid var(--border-subtle);
}
.ca-table th.num,
.ca-table td.num { text-align: right; }

.ca-row {
  border-bottom: 1px solid var(--border-subtle);
  cursor: pointer;
  transition: background 0.12s;
}
.ca-row:hover { background: var(--surface-hover); }
.ca-row.is-selected { background: rgba(var(--accent-primary-rgb), 0.08); }

.ca-table td {
  padding: 9px 12px;
  color: var(--text-main);
  font-variant-numeric: tabular-nums;
}
.ca-name {
  font-weight: 500;
  max-width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.expense    { color: var(--danger-color); }
.income     { color: var(--success-color); }
.savings    { color: #eab308; }
.investment { color: #3b82f6; }
.positive { color: var(--success-color); font-weight: 600; }
.negative { color: var(--danger-color);  font-weight: 600; }
.muted   { color: var(--text-faded); }

.pc { min-width: 80px; }
.bar-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: flex-end;
}
.bar-fill {
  height: 6px;
  background: var(--danger-color);
  border-radius: 3px;
  opacity: 0.5;
  min-width: 2px;
  transition: width 0.3s;
}
.bar-label { font-size: 0.75rem; color: var(--text-faded); min-width: 32px; text-align: right; }

.ca-total {
  background: var(--overlay-2);
  border-top: 2px solid var(--border-color);
}
.ca-total td {
  font-weight: 700;
  color: var(--text-main);
  padding: 10px 12px;
}

.ca-section {
  border-top: 1px solid var(--border-subtle);
}
.ca-section:first-of-type {
  border-top: none;
}
.income-section {
  margin-top: 12px;
  border-top: 2px solid var(--border-subtle);
}

.ca-summary {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 4px 16px;
  padding: 12px 16px;
  border-top: 2px solid var(--border-color);
  background: var(--overlay-2);
}
.summary-item {
  display: flex;
  align-items: baseline;
  gap: 6px;
}
.summary-label {
  font-size: 0.75rem;
  color: var(--text-faded);
}
.summary-value {
  font-size: 0.95rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.summary-sep {
  color: var(--border-color);
  font-size: 0.85rem;
}
.positive { color: var(--success-color); font-weight: 600; }
.negative { color: var(--danger-color);  font-weight: 600; }

.section-label {
  padding: 7px 16px 5px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border-bottom: 1px solid var(--border-subtle);
}
.expense-label {
  color: var(--danger-color);
  background: var(--color-lose-bg);
}
.income-label {
  color: var(--success-color);
  background: var(--color-win-bg);
}
.savings-label {
  color: #eab308;
  background: rgba(234, 179, 8, 0.08);
}
.investment-label {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.08);
}

.savings-section,
.investment-section {
  margin-top: 12px;
  border-top: 2px solid var(--border-subtle);
}

.expense-bar    { background: var(--danger-color); }
.income-bar     { background: var(--success-color); }
.savings-bar    { background: #eab308; }
.investment-bar { background: #3b82f6; }

.sub-section {
  border-top: 1px solid var(--border-subtle);
  background: var(--overlay-1);
}
.sub-title {
  margin: 0;
  padding: 10px 16px 6px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-sub);
}

.chevron {
  margin-left: 6px;
  font-size: 0.62rem;
  color: var(--text-faded);
}

.entry-row {
  background: var(--overlay-2);
  border-bottom: 1px solid var(--border-subtle);
}
.entry-row:hover { background: var(--surface-hover); }

.entry-date {
  padding: 6px 12px 6px 24px;
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
  font-variant-numeric: tabular-nums;
}
.entry-memo {
  font-size: 0.8rem;
  color: var(--text-sub);
  padding: 6px 12px;
}

@media (max-width: 600px) {
  .pc { display: none; }
  .ca-table td, .ca-table th { padding: 7px 8px; font-size: 0.8rem; }
}
</style>
