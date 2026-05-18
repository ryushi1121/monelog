import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import router from './router'
import './assets/styles/main.css'
import { registerSW } from 'virtual:pwa-register'
import ja from './locales/ja.json'
import en from './locales/en.json'
import { getSavedLocale } from './composables/useLocale'

if ('serviceWorker' in navigator) {
  registerSW({ immediate: true })
}

const i18n = createI18n({
  legacy: false,
  locale: getSavedLocale() || 'ja',
  fallbackLocale: 'ja',
  messages: { ja, en },
})

const app = createApp(App)
app.use(i18n)
app.use(router)
app.mount('#app')
