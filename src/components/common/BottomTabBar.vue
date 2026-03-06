<template>
  <nav class="bottom-tab-bar">
    <router-link
      v-for="tab in tabs"
      :key="tab.path"
      :to="tab.path"
      class="tab-item"
      :class="{ active: isActive(tab.path) }"
    >
      <span class="tab-icon">{{ tab.icon }}</span>
      <span class="tab-label">{{ t(tab.label) }}</span>
    </router-link>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const { t } = useI18n()
const userStore = useUserStore()

const tabs = [
  { path: '/home', icon: '🏠', label: 'tab.home' },
  { path: '/promotions', icon: '🎁', label: 'tab.promotions' },
  { path: '/support', icon: '💬', label: 'tab.support' },
  { path: '/download', icon: '📲', label: 'tab.download' },
  { path: '/profile', icon: '👤', label: 'tab.my' }
]

function isActive(path) {
  return route.path === path
}
</script>

<style lang="scss" scoped>
.bottom-tab-bar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: $max-width;
  height: $tab-bar-height;
  background: $bg-header;
  display: flex;
  align-items: center;
  justify-content: space-around;
  border-top: 1px solid $border-color;
  z-index: 100;
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  flex: 1;
  color: $text-muted;
  transition: color 0.2s;

  &.active {
    color: $accent-purple-light;
  }
}

.tab-icon {
  font-size: 22px;
}

.tab-label {
  font-size: 10px;
}
</style>
