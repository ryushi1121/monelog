<template>
  <div class="login-page">
    <div class="login-bg">
      <div class="bg-orb bg-orb-1"></div>
      <div class="bg-orb bg-orb-2"></div>
      <div class="bg-orb bg-orb-3"></div>
    </div>

    <div class="login-container animate-fade-in-up">
      <div class="login-card card-glass">
        <div class="login-header">
          <div class="login-logo">
            <img src="/favicon.svg" alt="MoneLog Logo" width="80" height="80" />
          </div>
          <h1 class="login-title">MoneLog</h1>
          <p class="login-subtitle" v-html="t('login.subtitle').replace(/\n/g, '<br />')"></p>
        </div>

        <div class="login-features">
          <div class="feature-item">
            <i class="feature-icon fa-solid fa-receipt"></i>
            <span class="feature-text">{{ t('login.featureEntry') }}</span>
          </div>
          <div class="feature-item">
            <i class="feature-icon fa-solid fa-chart-pie"></i>
            <span class="feature-text">{{ t('login.featureAnalytics') }}</span>
          </div>
          <div class="feature-item">
            <i class="feature-icon fa-solid fa-chart-line"></i>
            <span class="feature-text">{{ t('login.featureCharts') }}</span>
          </div>
        </div>

        <button
          class="login-btn"
          @click="handleLogin"
          :disabled="isLoading"
          id="google-login-btn"
        >
          <svg class="google-icon" viewBox="0 0 24 24" width="20" height="20">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span v-if="!isLoading">{{ t('login.loginBtn') }}</span>
          <span v-else class="login-loading">
            <span class="loading-spinner"></span>
            {{ t('login.loggingIn') }}
          </span>
        </button>

        <p v-if="errorMessage" class="login-error">{{ errorMessage }}</p>

        <p class="login-note">{{ t('login.note') }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuth } from '../composables/useAuth'

export default {
  name: 'LoginView',
  setup() {
    const router = useRouter()
    const { isLoggedIn, login, authError } = useAuth()
    const { t } = useI18n()
    const isLoading = ref(false)
    const errorMessage = ref('')

    watch(isLoggedIn, (loggedIn) => {
      if (loggedIn) router.push({ name: 'Dashboard' })
    })

    watch(authError, (newError) => {
      if (newError) errorMessage.value = newError
    })

    async function handleLogin() {
      isLoading.value = true
      errorMessage.value = ''
      try {
        await login()
      } catch (error) {
        errorMessage.value = error.message || t('login.loggingIn')
      } finally {
        setTimeout(() => { isLoading.value = false }, 1000)
      }
    }

    return { isLoading, errorMessage, handleLogin, t }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  position: relative;
  overflow: hidden;
}

.login-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.3;
  animation: float 8s ease-in-out infinite;
}

.bg-orb-1 {
  width: 400px;
  height: 400px;
  background: var(--accent-primary);
  top: -10%;
  right: -5%;
  animation-delay: 0s;
}

.bg-orb-2 {
  width: 300px;
  height: 300px;
  background: var(--accent-secondary);
  bottom: -10%;
  left: -5%;
  animation-delay: 2s;
}

.bg-orb-3 {
  width: 200px;
  height: 200px;
  background: var(--color-win);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: 4s;
  opacity: 0.15;
}

@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-30px) scale(1.05); }
}

.login-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 420px;
  padding: var(--spacing-lg);
}

.login-card {
  padding: var(--spacing-2xl);
  text-align: center;
}

.login-header {
  margin-bottom: var(--spacing-xl);
}

.login-logo {
  display: flex;
  justify-content: center;
  margin-bottom: var(--spacing-md);
}

.login-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: var(--spacing-sm);
}

.login-subtitle {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: 1.6;
}

.login-features {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-md);
  background: rgba(255, 255, 255, 0.02);
  border-radius: var(--border-radius-sm);
}

.feature-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.feature-icon {
  width: 24px;
  text-align: center;
}

.login-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  background: #fff;
  color: #333;
  border: none;
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-md);
  min-height: 48px;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}

.login-btn:active:not(:disabled) {
  transform: translateY(0);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.google-icon {
  flex-shrink: 0;
}

.login-loading {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.login-loading .loading-spinner {
  width: 18px;
  height: 18px;
  border-width: 2px;
  border-top-color: #333;
  border-color: #ccc;
}

.login-error {
  margin-top: var(--spacing-md);
  font-size: var(--font-size-sm);
  color: var(--color-lose);
}

.login-note {
  margin-top: var(--spacing-md);
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}
</style>
