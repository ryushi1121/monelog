<template>
  <div class="analytics-card card mb-4">
    <h3>{{ t('analytics.weekdayTitle') }}</h3>
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>{{ t('analytics.colWeekday') }}</th>
            <th class="text-right">{{ t('analytics.colCount') }}</th>
            <th class="text-right">{{ t('analytics.colExpense') }}</th>
            <th class="text-right">{{ t('analytics.colIncome') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="stat in weekdayStats" :key="stat.name">
            <td>{{ t(`weekdays.${stat.name}`, stat.name) }}</td>
            <td class="text-right">{{ stat.count }}</td>
            <td class="text-right text-danger">{{ stat.totalExpense > 0 ? formatCurrency(stat.totalExpense) : '—' }}</td>
            <td class="text-right text-success">{{ stat.totalIncome > 0 ? '+' + formatCurrency(stat.totalIncome) : '—' }}</td>
          </tr>
          <tr v-if="weekdayStats.length === 0">
            <td colspan="4" class="text-center text-muted">{{ t('common.noData') }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { useAnalytics } from '@/composables/useAnalytics';
import { formatCurrency } from '@/utils/formatters';

const { t } = useI18n();
const { weekdayStats } = useAnalytics();
</script>
