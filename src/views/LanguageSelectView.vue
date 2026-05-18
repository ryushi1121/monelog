<template>
  <div class="lang-select-page">
    <div class="lang-bg">
      <div class="bg-orb bg-orb-1"></div>
      <div class="bg-orb bg-orb-2"></div>
    </div>

    <div class="lang-container animate-fade-in-up">
      <div class="lang-card card-glass">
        <div class="lang-header">
          <img src="/favicon.svg" alt="MoneLog" width="64" height="64" />
          <h1 class="lang-title">MoneLog</h1>
        </div>

        <p class="lang-prompt">
          言語を選択してください<br />
          <span class="lang-prompt-en">Select your language</span>
        </p>

        <div class="lang-options">
          <button
            class="lang-btn"
            :class="{ selected: selected === 'ja' }"
            @click="selected = 'ja'"
          >
            <span class="lang-flag">🇯🇵</span>
            <span class="lang-name">日本語</span>
          </button>
          <button
            class="lang-btn"
            :class="{ selected: selected === 'en' }"
            @click="selected = 'en'"
          >
            <span class="lang-flag">🇺🇸</span>
            <span class="lang-name">English</span>
          </button>
        </div>

        <button class="confirm-btn" @click="confirm" :disabled="!selected">
          確認 / Confirm
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useLocale } from '../composables/useLocale';

const router = useRouter();
const { setLocale } = useLocale();
const selected = ref('ja');

const confirm = () => {
  if (!selected.value) return;
  setLocale(selected.value);
  router.push({ name: 'Login' });
};
</script>

<style scoped>
.lang-select-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  position: relative;
  overflow: hidden;
}

.lang-bg {
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
  width: 350px;
  height: 350px;
  background: var(--accent-primary);
  top: -5%;
  right: -5%;
}

.bg-orb-2 {
  width: 280px;
  height: 280px;
  background: var(--accent-secondary);
  bottom: -5%;
  left: -5%;
  animation-delay: 3s;
}

@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-20px) scale(1.04); }
}

.lang-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 400px;
  padding: var(--spacing-lg);
}

.lang-card {
  padding: var(--spacing-2xl);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xl);
}

.lang-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
}

.lang-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.lang-prompt {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  line-height: 1.8;
  margin: 0;
}

.lang-prompt-en {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}

.lang-options {
  display: flex;
  gap: var(--spacing-md);
  width: 100%;
}

.lang-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg) var(--spacing-md);
  border-radius: var(--border-radius-md, 12px);
  border: 2px solid var(--border-color);
  background: var(--overlay-1);
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-family: inherit;
}

.lang-btn:hover {
  border-color: var(--accent-primary);
  background: rgba(var(--accent-primary-rgb), 0.08);
}

.lang-btn.selected {
  border-color: var(--accent-primary);
  background: rgba(var(--accent-primary-rgb), 0.12);
  box-shadow: 0 0 0 3px rgba(var(--accent-primary-rgb), 0.2);
}

.lang-flag {
  font-size: 2rem;
  line-height: 1;
}

.lang-name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
}

.confirm-btn {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--border-radius-sm);
  border: none;
  background: var(--accent-gradient);
  color: white;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-md);
  font-family: inherit;
}

.confirm-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}

.confirm-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
