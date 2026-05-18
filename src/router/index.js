import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { requiresAuth: false, layout: 'none' }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { requiresAuth: true, title: 'ダッシュボード', icon: 'fa-solid fa-chart-pie' }
  },
  {
    path: '/entry',
    name: 'Entry',
    component: () => import('../views/EntryView.vue'),
    meta: { requiresAuth: true, title: '明細登録', icon: 'fa-solid fa-pen-to-square' }
  },
  {
    path: '/entry/:id',
    name: 'EntryEdit',
    component: () => import('../views/EntryView.vue'),
    meta: { requiresAuth: true, title: '明細編集', icon: 'fa-solid fa-pen-to-square' }
  },
  {
    path: '/list',
    name: 'List',
    component: () => import('../views/ListView.vue'),
    meta: { requiresAuth: true, title: '明細一覧', icon: 'fa-solid fa-list' }
  },
  {
    path: '/analytics',
    name: 'Analytics',
    component: () => import('../views/AnalyticsView.vue'),
    meta: { requiresAuth: true, title: '集計', icon: 'fa-solid fa-table-list' }
  },
  {
    path: '/charts',
    name: 'Charts',
    component: () => import('../views/ChartsView.vue'),
    meta: { requiresAuth: true, title: '分析', icon: 'fa-solid fa-chart-area' }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/SettingsView.vue'),
    meta: { requiresAuth: true, title: '設定', icon: 'fa-solid fa-gear' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// ナビゲーションガード: 未認証時はログイン画面へ
router.beforeEach((to, from, next) => {
  const { isAuthPending } = useAuth()
  const accessToken = localStorage.getItem('google_access_token')
  const requiresAuth = to.meta.requiresAuth !== false

  // サイレントリフレッシュ中はリダイレクトしない（App.vueがローディング画面を表示）
  if (isAuthPending.value) {
    next()
    return
  }

  if (requiresAuth && !accessToken) {
    next({ name: 'Login' })
  } else if (to.name === 'Login' && accessToken) {
    next({ name: 'Dashboard' })
  } else {
    next()
  }
})

export default router
