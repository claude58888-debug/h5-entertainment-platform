<template>
  <div class="quick-actions">
    <div
      v-for="action in actions"
      :key="action.path"
      class="action-item"
      @click="handleAction(action.path)"
    >
      <div class="action-icon">
        <img :src="action.image" :alt="action.label" class="action-img" />
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
    image: 'https://rr86.online/static/img/%E9%87%91%E5%88%9A%E5%8C%BA_%E5%85%85%E5%80%BC.79e3487a.webp',
  },
  {
    label: '提现',
    path: '/withdraw',
    image: 'https://rr86.online/static/img/recharge.77f88fba.png',
  },
  {
    label: '任务',
    path: '/tasks',
    image: 'https://rr86.online/static/img/renwu.08955b7b.png',
  },
  {
    label: '我的收入',
    path: '/income',
    image: 'https://rr86.online/static/img/shouru.c9225545.png',
  },
  {
    label: '邀请好友',
    path: '/invite',
    image: 'https://rr86.online/static/img/inviteFriends.78ba91c4.png',
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
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-img {
  width: 44px;
  height: 44px;
  object-fit: contain;
}

.action-label {
  font-size: 11px;
  color: $text-secondary;
  white-space: nowrap;
}
</style>
