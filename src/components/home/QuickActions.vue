<template>
  <div class="quick-actions">
    <button
      v-for="action in actions"
      :key="action.path"
      class="action-item"
      @click="handleAction(action.path)"
    >
      <span class="action-icon" v-html="action.svg" aria-hidden="true"></span>
      <span class="action-label">{{ $t(action.labelKey) }}</span>
    </button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const ICON = (path) => `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`

const actions = [
  {
    labelKey: 'home.recharge',
    path: '/deposit',
    svg: ICON('<path d="M12 5v14"/><path d="M5 12l7-7 7 7"/>')
  },
  {
    labelKey: 'home.withdraw',
    path: '/withdraw',
    svg: ICON('<path d="M12 19V5"/><path d="M5 12l7 7 7-7"/>')
  },
  {
    labelKey: 'home.task',
    path: '/tasks',
    svg: ICON('<rect x="4" y="4" width="16" height="17" rx="2"/><path d="M9 2h6v4H9z"/><path d="M8 12l2 2 4-4"/>')
  },
  {
    labelKey: 'home.myIncome',
    path: '/income',
    svg: ICON('<path d="M12 2v20"/><path d="M17 6H9a3 3 0 0 0 0 6h6a3 3 0 0 1 0 6H6"/>')
  },
  {
    labelKey: 'home.inviteFriend',
    path: '/invite',
    svg: ICON('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 11h-6"/><path d="M19 8v6"/>')
  }
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
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
  padding: 10px 12px 6px;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 4px;
  background: $bg-card;
  border: 1px solid $border-subtle;
  border-radius: $radius-md;
  color: $text-primary;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.1s ease;

  &:active {
    transform: scale(0.97);
    background: $bg-card-hover;
  }
}

.action-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  color: $accent-gold;
}

.action-label {
  font-size: 11px;
  line-height: 1;
  color: $text-secondary;
  white-space: nowrap;
}
</style>
