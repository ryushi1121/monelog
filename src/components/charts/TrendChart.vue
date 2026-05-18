<template>
  <div class="chart-container card mb-4">
    <h3>{{ trendChartData ? trendChartData.title : '明細推移' }}</h3>
    <div class="chart-wrapper">
      <VueChart v-if="trendChartData" type="bar" :data="chartData" :options="chartOptions" />
      <div v-else class="empty-state text-muted text-center py-4">データがありません</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTheme } from '@/composables/useTheme';
import { Chart as VueChart } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  LineElement,
  LineController,
  PointElement,
  Tooltip,
  Legend
} from 'chart.js';
import Annotation from 'chartjs-plugin-annotation';
import { useAnalytics } from '@/composables/useAnalytics';
import { computeSyncedBounds, zeroLineAnnotation } from '@/utils/chartUtils';

ChartJS.register(CategoryScale, LinearScale, BarElement, BarController, LineElement, LineController, PointElement, Tooltip, Legend, Annotation);

const { trendChartData } = useAnalytics();
const { theme } = useTheme();
const { t, locale } = useI18n();

const cc = computed(() => {
  const isLight = theme.value === 'light';
  return {
    textSub: isLight ? '#657b83' : '#839496',
    grid:    isLight ? 'rgba(101,123,131,0.12)' : 'rgba(255,255,255,0.05)'
  };
});

const chartData = computed(() => {
  const data = trendChartData.value;
  if (!data) return { labels: [], datasets: [] };

  return {
    labels: data.labels,
    datasets: [
      {
        type: 'bar',
        label: t('charts.trend'),
        data: data.nets,
        backgroundColor: data.nets.map(v =>
          v === null ? 'transparent' : v >= 0 ? 'rgba(34,197,94,0.7)' : 'rgba(239,68,68,0.7)'
        ),
        borderColor: data.nets.map(v =>
          v === null ? 'transparent' : v >= 0 ? '#22c55e' : '#ef4444'
        ),
        borderWidth: 1,
        yAxisID: 'yLeft'
      },
      {
        type: 'line',
        label: t('charts.cumulative'),
        data: data.cumulative,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59,130,246,0.1)',
        borderWidth: 2,
        pointRadius: 2,
        tension: 0.3,
        yAxisID: 'yRight'
      }
    ]
  };
});

const chartOptions = computed(() => {
  const data = trendChartData.value;
  const bounds = data ? computeSyncedBounds(data.nets, data.cumulative) : null;

  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        labels: { color: cc.value.textSub, font: { size: 12 } }
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const val = ctx.parsed.y;
            if (val === null) return null;
            return `${ctx.dataset.label}: ${val >= 0 ? '+' : ''}¥${Math.abs(val).toLocaleString()}`;
          }
        }
      },
      ...zeroLineAnnotation
    },
    scales: {
      x: {
        ticks: { color: cc.value.textSub, font: { size: 11 } },
        grid: { color: cc.value.grid }
      },
      yLeft: {
        type: 'linear',
        position: 'left',
        min: bounds?.left.min,
        max: bounds?.left.max,
        ticks: {
          color: cc.value.textSub,
          font: { size: 11 },
          callback: v => locale.value === 'en' ? `${Math.round(v / 1000)}K` : `${Math.round(v / 1000)}千`
        },
        grid: { color: cc.value.grid }
      },
      yRight: {
        type: 'linear',
        position: 'right',
        min: bounds?.right.min,
        max: bounds?.right.max,
        ticks: {
          color: '#3b82f6',
          font: { size: 11 },
          callback: v => locale.value === 'en' ? `${Math.round(v / 1000)}K` : `${Math.round(v / 1000)}千`
        },
        grid: { drawOnChartArea: false }
      }
    }
  };
});
</script>

<style scoped>
.chart-wrapper {
  position: relative;
  width: 100%;
  height: 300px;
  overflow: hidden;
  margin-top: 10px;
}
@media (max-width: 600px) {
  .chart-wrapper {
    height: 220px;
  }
}
</style>
