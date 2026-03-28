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
      <span class="action-label">{{ $t(action.labelKey) }}</span>
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
    labelKey: 'home.recharge',
    path: '/deposit',
    image: '/img/icons/deposit.webp',
  },
  {
    labelKey: 'home.withdraw',
    path: '/withdraw',
    image: '/img/icons/withdraw.png',
  },
  {
    labelKey: 'home.task',
    path: '/tasks',
    image: '/img/icons/task.png',
  },
  {
    labelKey: 'home.myIncome',
    path: '/income',
    image: '/img/icons/income.png',
  },
  {
    labelKey: 'home.inviteFriend',
    path: '/invite',
    image: '/img/icons/invite.png',
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
  padding: 2px 8px 0px;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  min-width: 56px;

  &:active {
    transform: scale(0.95);
  }
}

.action-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-img {
  width: 48px;
  height: 48px;
  object-fit: contain;
}

.action-label {
  font-size: 13px;
  color: $text-secondary;
  white-space: nowrap;
}
</style>
