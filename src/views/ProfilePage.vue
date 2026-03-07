<template>
  <div class="profile-page">
    <div class="profile-header">
      <div class="avatar">
        <img :src="user?.avatar || 'https://picsum.photos/100/100?random=60'" alt="avatar" />
      </div>
      <div class="user-info">
        <h3>{{ user?.nickname || 'Guest' }}</h3>
        <p>{{ t('profile.userId') }}: {{ user?.id || '-' }}</p>
        <div class="vip-badge">{{ t('profile.vipLevel') }} {{ user?.vipLevel || 0 }}</div>
      </div>
    </div>

    <div class="balance-section">
      <div class="balance-card">
        <span class="balance-label">{{ t('wallet.balance') }}</span>
        <span class="balance-amount">{{ walletStore.balance.toFixed(2) }} USDT</span>
        <div class="balance-actions">
          <van-button size="small" type="primary" round @click="$router.push('/deposit')">{{ t('actions.deposit') }}</van-button>
          <van-button size="small" round @click="$router.push('/withdraw')" class="outline-btn">{{ t('actions.withdraw') }}</van-button>
        </div>
      </div>
    </div>

    <div class="menu-section">
      <van-cell-group>
        <van-cell :title="t('actions.tasks')" is-link @click="$router.push('/tasks')" icon="todo-list-o" />
        <van-cell :title="t('actions.income')" is-link @click="$router.push('/income')" icon="chart-trending-o" />
        <van-cell :title="t('actions.invite')" is-link @click="$router.push('/invite')" icon="friends-o" />
        <van-cell :title="t('promotions.title')" is-link @click="$router.push('/promotions')" icon="gift-o" />
        <van-cell :title="t('profile.help')" is-link @click="$router.push('/support')" icon="question-o" />
        <van-cell :title="t('profile.about')" is-link icon="info-o" />
      </van-cell-group>
    </div>

    <div class="logout-section" v-if="userStore.isLoggedIn">
      <van-button round block type="danger" @click="handleLogout">{{ t('common.logout') }}</van-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import { useWalletStore } from '@/stores/wallet'
import { showToast } from 'vant'

const { t } = useI18n()
const router = useRouter()
const userStore = useUserStore()
const walletStore = useWalletStore()
const user = computed(() => userStore.user)

function handleLogout() {
  userStore.logout()
  showToast({ message: t('auth.logoutSuccess'), position: 'bottom' })
  router.push('/home')
}
</script>

<style lang="scss" scoped>
.profile-header {
  background: linear-gradient(135deg, $accent-purple, #4c1d95);
  padding: 24px 16px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.3);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.user-info {
  h3 {
    font-size: 18px;
    margin-bottom: 4px;
  }

  p {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 6px;
  }
}

.vip-badge {
  display: inline-block;
  background: $accent-gold;
  color: #000;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 10px;
}

.balance-section {
  padding: 16px;
}

.balance-card {
  background: $bg-card;
  border-radius: 12px;
  padding: 16px;
}

.balance-label {
  font-size: 12px;
  color: $text-secondary;
  display: block;
}

.balance-amount {
  font-size: 24px;
  font-weight: 700;
  display: block;
  margin: 4px 0 12px;
}

.balance-actions {
  display: flex;
  gap: 10px;
}

.outline-btn {
  background: transparent !important;
  border-color: $accent-purple !important;
  color: $accent-purple-light !important;
}

.menu-section {
  padding: 0 16px;
  margin-bottom: 24px;

  :deep(.van-cell-group) {
    background: $bg-card;
    border-radius: 12px;
    overflow: hidden;
  }

  :deep(.van-cell) {
    background: $bg-card;
    color: $text-primary;

    .van-cell__right-icon {
      color: $text-muted;
    }
    .van-icon {
      color: $accent-purple-light;
    }
  }
}

.logout-section {
  padding: 0 16px 24px;
}
</style>
