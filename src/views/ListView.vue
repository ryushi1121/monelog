<template>
  <div class="list-view">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('list.title') }}</h1>
        <p class="page-subtitle">{{ t('list.subtitle') }}</p>
      </div>
    </div>

    <FilterPanel
      ref="filterPanelRef"
      :categories="suggestCategories"
      @filter-change="handleFilterChange"
    />

    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>{{ t('common.loading') }}</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="forceReload" class="btn btn-outline">{{ t('common.retry') }}</button>
    </div>

    <div v-else class="list-content">
      <div v-if="isMonthMode" class="cal-header-row">
        <div class="view-toggle">
          <button :class="{ active: viewMode === 'calendar' }" @click="viewMode = 'calendar'">
            <i class="fa-solid fa-calendar-days"></i> {{ t('list.calendarView') }}
          </button>
          <button :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'">
            <i class="fa-solid fa-list"></i> {{ t('list.listView') }}
          </button>
        </div>
        <div v-if="viewMode === 'calendar'" class="cal-nav">
          <button class="cal-nav-btn" @click="prevMonth">
            <i class="fa-solid fa-chevron-left"></i>
          </button>
          <span class="cal-nav-label">{{ calendarMonthLabel }}</span>
          <button class="cal-nav-btn" @click="nextMonth">
            <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>

      <MonthCalendar
        v-if="isMonthMode && viewMode === 'calendar'"
        :entries="filteredEntries"
        :year-month="calendarMonth"
      />
      <EntryTable
        v-else
        :entries="filteredEntries"
        @delete-entry="handleDelete"
        @bulk-delete="handleBulkDelete"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useEntries } from '../composables/useEntries';
import FilterPanel from '../components/list/FilterPanel.vue';
import EntryTable from '../components/list/EntryTable.vue';
import MonthCalendar from '../components/list/MonthCalendar.vue';

const { t, locale } = useI18n();
const { entries, isLoading, error, loadEntries, removeEntry, removeBulk, suggestCategories, isLoaded } = useEntries();
const currentFilters = ref(null);
const viewMode = ref('calendar');
const calendarMonth = ref(null);
const filterPanelRef = ref(null);

const isMonthMode = computed(() => currentFilters.value?.periodType === 'month');

watch(() => currentFilters.value?.periodValue, (val) => {
  if (isMonthMode.value && val && val !== calendarMonth.value) calendarMonth.value = val;
}, { immediate: true });

watch(isMonthMode, (v) => {
  if (!v) viewMode.value = 'list';
  else {
    viewMode.value = 'calendar';
    calendarMonth.value = currentFilters.value?.periodValue ?? null;
  }
});

const calendarMonthLabel = computed(() => {
  if (!calendarMonth.value) return '';
  const [y, m] = calendarMonth.value.split('-');
  if (locale.value === 'en') {
    return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  }
  return `${y}年${parseInt(m)}月`;
});

const prevMonth = () => {
  if (!calendarMonth.value) return;
  const [y, m] = calendarMonth.value.split('-').map(Number);
  const d = new Date(y, m - 2, 1);
  const newMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  calendarMonth.value = newMonth;
  filterPanelRef.value?.setMonth(newMonth);
};

const nextMonth = () => {
  if (!calendarMonth.value) return;
  const [y, m] = calendarMonth.value.split('-').map(Number);
  const d = new Date(y, m, 1);
  const newMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  calendarMonth.value = newMonth;
  filterPanelRef.value?.setMonth(newMonth);
};

const filteredEntries = computed(() => {
  if (!currentFilters.value) return entries.value;
  let result = entries.value;
  const { periodType, periodValue, type, category } = currentFilters.value;
  if (periodType === 'month') {
    const target = (viewMode.value === 'calendar' && calendarMonth.value) ? calendarMonth.value : periodValue;
    if (target) result = result.filter(e => e.date.startsWith(target));
  } else if (periodType === 'year' && periodValue) {
    result = result.filter(e => e.date.startsWith(periodValue));
  }
  if (type) result = result.filter(e => e.type === type);
  if (category) result = result.filter(e => e.category === category);
  return result;
});

const handleFilterChange = (filters) => { currentFilters.value = filters; };

const handleDelete = async (id) => {
  try {
    await removeEntry(id);
  } catch (err) {
    alert(t('list.deleteError', { msg: err.message }));
  }
};

const handleBulkDelete = async (ids) => {
  try {
    await removeBulk(ids);
  } catch (err) {
    alert(err.message);
  }
};

const forceReload = () => loadEntries();

onMounted(() => {
  if (!isLoaded.value) loadEntries();
});
</script>

<style scoped>
.list-view {
  padding: 1rem;
  animation: fadeIn 0.3s ease-out;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
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
  border-top-color: var(--accent-primary);
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.cal-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.view-toggle {
  display: flex;
  gap: 6px;
}
.view-toggle button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-sub);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}
.view-toggle button:hover {
  background: var(--surface-hover);
  color: var(--text-main);
}
.view-toggle button.active {
  background: var(--accent-primary);
  color: var(--text-inverse);
  border-color: var(--accent-primary);
  font-weight: 600;
}

.cal-nav {
  display: flex;
  align-items: center;
  gap: 10px;
}
.cal-nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-sub);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.8rem;
}
.cal-nav-btn:hover {
  background: var(--surface-hover);
  color: var(--text-main);
  border-color: var(--border-color-hover);
}
.cal-nav-label {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-main);
  min-width: 90px;
  text-align: center;
}
</style>
