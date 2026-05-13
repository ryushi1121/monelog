<template>
  <!-- サイレントリフレッシュ確認中 -->
  <div v-if="isAuthPending" class="auth-pending">
    <div class="auth-pending-spinner"></div>
    <p class="auth-pending-text">接続を確認しています...</p>
  </div>

  <!-- ログイン画面はレイアウトなし -->
  <div v-else-if="$route.meta.layout === 'none'" class="app-no-layout">
    <router-view />
  </div>

  <!-- メインレイアウト -->
  <div v-else class="app-layout">
    <AppHeader
      :user="user"
      :sidebarOpen="sidebarOpen"
      @toggle-sidebar="sidebarOpen = !sidebarOpen"
      @logout="handleLogout"
    />
    <AppSidebar
      :open="sidebarOpen"
      @close="sidebarOpen = false"
    />
    <main class="app-main" :class="{ 'sidebar-open': sidebarOpen }">
      <div class="app-content">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from './composables/useAuth'
import { useEntries } from './composables/useEntries'
import AppHeader from './components/common/AppHeader.vue'
import AppSidebar from './components/common/AppSidebar.vue'

export default {
  name: 'App',
  components: { AppHeader, AppSidebar },
  setup() {
    const router = useRouter()
    const { user, isLoggedIn, isAuthPending, logout } = useAuth()
    const { clearEntries } = useEntries()

    // サイレントリフレッシュ失敗時にログイン画面へ
    watch(isAuthPending, (pending) => {
      if (!pending && !isLoggedIn.value) {
        router.push({ name: 'Login' })
      }
    })
    const sidebarOpen = ref(window.innerWidth >= 1024)

    const handleResize = () => {
      if (window.innerWidth < 1024) {
        sidebarOpen.value = false
      }
    }

    const handleLogout = () => {
      logout()
      clearEntries()
      router.push({ name: 'Login' })
    }

    onMounted(() => {
      window.addEventListener('resize', handleResize)
    })

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
    })

    return {
      user,
      isAuthPending,
      sidebarOpen,
      handleLogout
    }
  }
}
</script>

<style scoped>
.auth-pending {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  gap: var(--spacing-md);
}

.auth-pending-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.auth-pending-text {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.app-no-layout {
  min-height: 100vh;
}

.app-layout {
  min-height: 100vh;
  background: var(--bg-primary);
}

.app-main {
  margin-top: var(--header-height);
  margin-left: 0;
  min-height: calc(100vh - var(--header-height));
  transition: margin-left var(--transition-base);
  padding: var(--spacing-lg);
}

.app-main.sidebar-open {
  margin-left: var(--sidebar-width);
}

.app-content {
  max-width: var(--content-max-width);
  margin: 0 auto;
}

/* Page transitions */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Mobile */
@media (max-width: 1023px) {
  .app-main {
    padding: var(--spacing-md);
  }

  .app-main.sidebar-open {
    margin-left: 0;
  }
}
</style>
