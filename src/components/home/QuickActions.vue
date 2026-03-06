<template>
  <div class="quick-actions">
    <div
      v-for="action in actions"
      :key="action.path"
      class="action-item"
      @click="handleAction(action.path)"
    >
      <div class="action-icon" :style="{ background: action.bg }">
        <span>{{ action.icon }}</span>
      </div>
      <span class="action-label">{{ t(action.label) }}</span>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const { t } = useI18n()
const userStore = useUserStore()

const actions = [
  { icon: '💰', label: 'actions.deposit', path: '/deposit', bg: 'linear-gradient(135deg, #f59e0b, #d97706)' },
  { icon: '💸', label: 'actions.withdraw', path: '/withdraw', bg: 'linear-gradient(135deg, #10b981, #059669)' },
  { icon: '📋', label: 'actions.tasks', path: '/tasks', bg: 'linear-gradient(135deg, #3b82f6, #2563eb)' },
  { icon: '📈', label: 'actions.income', path: '/income', bg: 'linear-gradient(135deg, #ef4444, #dc2626)' },
  { icon: '👥', label: 'actions.invite', path: '/invite', bg: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }
]

function handleAction(path) {
  if (!userStore.isLoggedIn) {
    userStore.showLoginModal = true
    return
  }
  router.push(path)
}
</script>

<style lang="scss" scoped>
.quick-actions {
  display: flex;
  justify-content: space-around;
  padding: 16px 12px;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;

  &:active {
    transform: scale(0.95);
  }
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.action-label {
  font-size: 11px;
  color: $text-secondary;
}
</style>
