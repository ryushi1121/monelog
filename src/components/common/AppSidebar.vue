<template>
  <aside class="sidebar" :class="{ open }">
    <nav class="sidebar-nav">
      <router-link
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="nav-item"
        :class="{ active: $route.path === item.to }"
        @click="handleNavClick"
        :id="'nav-' + item.id"
      >
        <i class="nav-icon" :class="item.icon"></i>
        <span class="nav-label">{{ t(item.labelKey) }}</span>
      </router-link>
    </nav>

    <div class="sidebar-footer">
      <div class="sidebar-version">v1.0.0</div>
    </div>
  </aside>

  <div
    v-if="open"
    class="sidebar-overlay"
    @click="$emit('close')"
  ></div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';

const props = defineProps({ open: { type: Boolean, default: false } });
const emit = defineEmits(['close']);

const { t } = useI18n();

const navItems = [
  { to: '/',          labelKey: 'nav.dashboard', icon: 'fa-solid fa-house',      id: 'dashboard' },
  { to: '/entry',     labelKey: 'nav.record',    icon: 'fa-solid fa-receipt',    id: 'entry' },
  { to: '/list',      labelKey: 'nav.list',      icon: 'fa-solid fa-wallet',     id: 'list' },
  { to: '/analytics', labelKey: 'nav.analytics', icon: 'fa-solid fa-chart-pie',  id: 'analytics' },
  { to: '/charts',    labelKey: 'nav.charts',    icon: 'fa-solid fa-chart-line', id: 'charts' },
  { to: '/settings',  labelKey: 'nav.settings',  icon: 'fa-solid fa-gear',       id: 'settings' },
];

const handleNavClick = () => {
  if (window.innerWidth < 1024) emit('close');
};
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: var(--header-height);
  left: 0;
  bottom: 0;
  width: var(--sidebar-width);
  background: var(--sidebar-bg);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-right: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  z-index: var(--z-sidebar);
  transform: translateX(-100%);
  transition: transform var(--transition-base);
  overflow-y: auto;
}

.sidebar.open {
  transform: translateX(0);
}

.sidebar-nav {
  flex: 1;
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-sm);
  color: var(--text-secondary);
  text-decoration: none;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-fast);
  position: relative;
}

.nav-item:hover {
  color: var(--text-primary);
  background: var(--surface-hover);
}

.nav-item.active {
  color: var(--accent-primary);
  background: rgba(var(--accent-primary-rgb), 0.08);
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 60%;
  background: var(--accent-primary);
  border-radius: 0 3px 3px 0;
}

.nav-icon {
  font-size: 1.2rem;
  width: 28px;
  text-align: center;
  flex-shrink: 0;
}

.nav-label {
  white-space: nowrap;
}

.sidebar-footer {
  padding: var(--spacing-md);
  border-top: 1px solid var(--border-color);
}

.sidebar-version {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  text-align: center;
}

.sidebar-overlay {
  display: none;
}

@media (max-width: 1023px) {
  .sidebar-overlay {
    display: block;
    position: fixed;
    top: var(--header-height);
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--overlay-modal);
    z-index: calc(var(--z-sidebar) - 1);
    animation: fadeIn var(--transition-fast) ease;
  }
}
</style>
