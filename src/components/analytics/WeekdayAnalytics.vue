<template>
  <div class="analytics-card card mb-4">
    <h3>曜日別集計</h3>
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>曜日</th>
            <th class="text-right">件数</th>
            <th class="text-right">支出</th>
            <th class="text-right">収入</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="stat in weekdayStats" :key="stat.name">
            <td>{{ stat.name }}</td>
            <td class="text-right">{{ stat.count }}</td>
            <td class="text-right text-danger">{{ stat.totalExpense > 0 ? formatCurrency(stat.totalExpense) : '—' }}</td>
            <td class="text-right text-success">{{ stat.totalIncome > 0 ? '+' + formatCurrency(stat.totalIncome) : '—' }}</td>
          </tr>
          <tr v-if="weekdayStats.length === 0">
            <td colspan="4" class="text-center text-muted">データがありません</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { useAnalytics } from '@/composables/useAnalytics';
import { formatCurrency } from '@/utils/formatters';

const { weekdayStats } = useAnalytics();
</script>
