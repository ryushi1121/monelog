import { ref, computed } from 'vue';
import { useEntries } from './useEntries';

const periodType = ref('month');
const periodValue = ref(new Date().toISOString().substring(0, 7));
const selectedCategory = ref('');

export const useAnalytics = () => {
  const { entries } = useEntries();

  const filteredEntries = computed(() => {
    if (periodType.value === 'all') return entries.value;
    return entries.value.filter(entry => {
      if (!entry.date) return false;
      if (periodType.value === 'month') return entry.date.startsWith(periodValue.value);
      if (periodType.value === 'year') return entry.date.startsWith(periodValue.value);
      return true;
    });
  });

  const drilldownEntries = computed(() => {
    if (!selectedCategory.value) return filteredEntries.value;
    return filteredEntries.value.filter(e => e.category === selectedCategory.value);
  });

  const summaryStats = computed(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    drilldownEntries.value.forEach(e => {
      const amount = e.amount || 0;
      if (e.type === '収入') totalIncome += amount;
      else totalExpense += amount;
    });
    return {
      count: drilldownEntries.value.length,
      totalIncome,
      totalExpense,
      net: totalIncome - totalExpense,
    };
  });

  const _groupAndAggregate = (keySelector, baseEntries) => {
    const groups = {};
    baseEntries.forEach(e => {
      const key = keySelector(e);
      if (!key) return;
      if (!groups[key]) {
        groups[key] = { name: key, totalIncome: 0, totalExpense: 0, net: 0, count: 0 };
      }
      const amount = e.amount || 0;
      if (e.type === '収入') {
        groups[key].totalIncome += amount;
        groups[key].net += amount;
      } else {
        groups[key].totalExpense += amount;
        groups[key].net -= amount;
      }
      groups[key].count++;
    });
    return Object.values(groups).map(g => ({
      ...g,
      avgNet:     g.count > 0 ? Math.round(g.net / g.count) : 0,
      avgExpense: g.count > 0 ? Math.round(g.totalExpense / g.count) : 0,
    })).sort((a, b) => b.totalExpense - a.totalExpense);
  };

  // 期間内のカテゴリ一覧（フィルタ用）
  const availableCategories = computed(() => {
    const cats = new Set();
    filteredEntries.value.forEach(e => { if (e.category) cats.add(e.category); });
    return Array.from(cats).sort();
  });

  const categoryStats = computed(() => _groupAndAggregate(e => e.category, filteredEntries.value));

  const subcategoryStats = computed(() => _groupAndAggregate(e => e.subcategory || '分類なし', drilldownEntries.value));

  const weekdayStats = computed(() => {
    const stats = _groupAndAggregate(e => e.dayOfWeek, drilldownEntries.value);
    const weekOrder = { '月': 1, '火': 2, '水': 3, '木': 4, '金': 5, '土': 6, '日': 7 };
    return stats.sort((a, b) => (weekOrder[a.name] || 99) - (weekOrder[b.name] || 99));
  });

  const monthlyStats = computed(() => {
    const stats = _groupAndAggregate(e => e.date ? e.date.substring(0, 7) : '', drilldownEntries.value);
    return stats.filter(s => s.name).sort((a, b) => a.name.localeCompare(b.name));
  });

  const trendChartData = computed(() => {
    const buildSeries = (keys, mapNet, mapExpense, mapIncome) => {
      const labels = [''];
      const nets = [null];
      const expenses = [null];
      const incomes = [null];
      const cumulative = [0];
      let cum = 0;
      keys.forEach(key => {
        const net = mapNet(key);
        cum += net;
        labels.push(key);
        nets.push(net);
        expenses.push(mapExpense(key));
        incomes.push(mapIncome(key));
        cumulative.push(cum);
      });
      return { labels, nets, expenses, incomes, cumulative };
    };

    const selectionSuffix = selectedCategory.value ? `（${selectedCategory.value}）` : '';

    if (periodType.value === 'month' && periodValue.value) {
      const [year, month] = periodValue.value.split('-').map(Number);
      const daysInMonth = new Date(year, month, 0).getDate();
      const dailyExpense = {};
      const dailyIncome = {};
      for (let d = 1; d <= daysInMonth; d++) {
        const key = `${periodValue.value}-${String(d).padStart(2, '0')}`;
        dailyExpense[key] = 0;
        dailyIncome[key] = 0;
      }
      drilldownEntries.value.forEach(e => {
        if (!e.date || dailyExpense[e.date] === undefined) return;
        if (e.type === '収入') dailyIncome[e.date] += e.amount || 0;
        else dailyExpense[e.date] += e.amount || 0;
      });
      const keys = Array.from({ length: daysInMonth }, (_, i) => {
        const d = i + 1;
        return { label: `${d}日`, dateKey: `${periodValue.value}-${String(d).padStart(2, '0')}` };
      });
      const labels = ['', ...keys.map(k => k.label)];
      const expenses = [null, ...keys.map(k => dailyExpense[k.dateKey])];
      const incomes = [null, ...keys.map(k => dailyIncome[k.dateKey])];
      const nets = [null, ...keys.map(k => dailyIncome[k.dateKey] - dailyExpense[k.dateKey])];
      const cumulative = [0];
      let cum = 0;
      keys.forEach(k => { cum += dailyIncome[k.dateKey] - dailyExpense[k.dateKey]; cumulative.push(cum); });
      const [y, m] = periodValue.value.split('-').map(Number);
      const titlePeriod = `${y}年${m}月`;
      return { labels, nets, expenses, incomes, cumulative, title: `日別収支（${titlePeriod}）${selectionSuffix}` };
    }

    if (periodType.value === 'year' && periodValue.value) {
      const year = periodValue.value;
      const monthlyExpense = {};
      const monthlyIncome = {};
      for (let m = 1; m <= 12; m++) {
        const key = String(m).padStart(2, '0');
        monthlyExpense[key] = 0;
        monthlyIncome[key] = 0;
      }
      drilldownEntries.value.forEach(e => {
        if (!e.date) return;
        const m = e.date.substring(5, 7);
        if (e.type === '収入') monthlyIncome[m] = (monthlyIncome[m] || 0) + (e.amount || 0);
        else monthlyExpense[m] = (monthlyExpense[m] || 0) + (e.amount || 0);
      });
      const monthKeys = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
      const result = buildSeries(
        monthKeys,
        m => (monthlyIncome[m] || 0) - (monthlyExpense[m] || 0),
        m => monthlyExpense[m] || 0,
        m => monthlyIncome[m] || 0,
      );
      result.labels = result.labels.map((l, i) => i === 0 ? '' : `${parseInt(l)}月`);
      result.title = `月別収支推移（${year}年）${selectionSuffix}`;
      return result;
    }

    // 全期間: 年別
    const yearSet = new Set();
    drilldownEntries.value.forEach(e => { if (e.date) yearSet.add(e.date.substring(0, 4)); });
    const years = Array.from(yearSet).sort();
    if (years.length === 0) return null;
    const yearlyExpense = {};
    const yearlyIncome = {};
    years.forEach(y => { yearlyExpense[y] = 0; yearlyIncome[y] = 0; });
    drilldownEntries.value.forEach(e => {
      if (!e.date) return;
      const y = e.date.substring(0, 4);
      if (e.type === '収入') yearlyIncome[y] += e.amount || 0;
      else yearlyExpense[y] += e.amount || 0;
    });
    const result = buildSeries(
      years,
      y => (yearlyIncome[y] || 0) - (yearlyExpense[y] || 0),
      y => yearlyExpense[y] || 0,
      y => yearlyIncome[y] || 0,
    );
    result.labels = result.labels.map((l, i) => i === 0 ? '' : `${l}年`);
    result.title = `年別収支推移（全期間）${selectionSuffix}`;
    return result;
  });

  const setSelectedCategory = (name) => {
    selectedCategory.value = selectedCategory.value === name ? '' : name;
  };

  return {
    periodType,
    periodValue,
    selectedCategory,
    filteredEntries,
    drilldownEntries,
    availableCategories,
    summaryStats,
    categoryStats,
    subcategoryStats,
    weekdayStats,
    monthlyStats,
    trendChartData,
    setSelectedCategory,
  };
};
