<template>
  <div class="quick-actions">
    <div
      v-for="action in actions"
      :key="action.path"
      class="action-item"
      @click="handleAction(action.path)"
    >
      <div class="action-icon" :style="{ background: action.bg }">
        <svg :viewBox="action.viewBox || '0 0 24 24'" width="20" height="20" fill="none" stroke="white" stroke-width="2" v-html="action.svg"></svg>
      </div>
      <span class="action-label">{{ action.label }}</span>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const actions = [
  {
    label: '充值',
    path: '/deposit',
    bg: 'linear-gradient(135deg, #f0c040, #e67e22)',
    svg: '<circle cx="12" cy="12" r="8"/><path d="M12 8v8M8 12h8"/>',
  },
  {
    label: '提现',
    path: '/withdraw',
    bg: 'linear-gradient(135deg, #00b894, #00cec9)',
    svg: '<path d="M12 2v14M5 10l7 7 7-7"/><path d="M5 20h14"/>',
  },
  {
    label: '任务',
    path: '/tasks',
    bg: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    svg: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="rgba(255,255,255,0.3)"/>',
  },
  {
    label: '我的收入',
    path: '/income',
    bg: 'linear-gradient(135deg, #e84393, #fd79a8)',
    svg: '<path d="M20 12v7a2 2 0 01-2 2H6a2 2 0 01-2-2v-7"/><path d="M12 17V3M8 7l4-4 4 4"/>',
  },
  {
    label: '邀请好友',
    path: '/invite',
    bg: 'linear-gradient(135deg, #6c5ce7, #a855f7)',
    svg: '<path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6M23 11h-6"/>',
    viewBox: '0 0 24 24',
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
  display: flex;
  justify-content: space-around;
  padding: 12px 8px 8px;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  min-width: 56px;

  &:active {
    transform: scale(0.95);
  }
}

.action-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-label {
  font-size: 11px;
  color: $text-secondary;
  white-space: nowrap;
}
</style>
