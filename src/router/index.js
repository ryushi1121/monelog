import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { isLocaleSet } from '../composables/useLocale'

const routes = [
  {
    path: '/language',
    name: 'LanguageSelect',
    component: () => import('../views/LanguageSelectView.vue'),
    meta: { requiresAuth: false, layout: 'none' }
  },
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
    meta: { requiresAuth: true, titleKey: 'nav.dashboard', icon: 'fa-solid fa-chart-pie' }
  },
  {
    path: '/entry',
    name: 'Entry',
    component: () => import('../views/EntryView.vue'),
    meta: { requiresAuth: true, titleKey: 'nav.record', icon: 'fa-solid fa-pen-to-square' }
  },
  {
    path: '/entry/:id',
    name: 'EntryEdit',
    component: () => import('../views/EntryView.vue'),
    meta: { requiresAuth: true, titleKey: 'nav.record', icon: 'fa-solid fa-pen-to-square' }
  },
  {
    path: '/list',
    name: 'List',
    component: () => import('../views/ListView.vue'),
    meta: { requiresAuth: true, titleKey: 'nav.list', icon: 'fa-solid fa-list' }
  },
  {
    path: '/analytics',
    name: 'Analytics',
    component: () => import('../views/AnalyticsView.vue'),
    meta: { requiresAuth: true, titleKey: 'nav.analytics', icon: 'fa-solid fa-table-list' }
  },
  {
    path: '/charts',
    name: 'Charts',
    component: () => import('../views/ChartsView.vue'),
    meta: { requiresAuth: true, titleKey: 'nav.charts', icon: 'fa-solid fa-chart-area' }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/SettingsView.vue'),
    meta: { requiresAuth: true, titleKey: 'nav.settings', icon: 'fa-solid fa-gear' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const { isAuthPending } = useAuth()
  const accessToken = localStorage.getItem('google_access_token')
  const requiresAuth = to.meta.requiresAuth !== false

  // 言語未選択なら言語選択画面へ（言語選択画面自体は除く）
  if (!isLocaleSet() && to.name !== 'LanguageSelect') {
    next({ name: 'LanguageSelect' })
    return
  }

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
