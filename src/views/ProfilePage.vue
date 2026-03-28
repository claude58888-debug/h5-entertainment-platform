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

    <!-- 2a: VIP Progress Bar -->
    <div class="vip-progress-section">
      <div class="vip-progress">
        <span class="vip-label">VIP{{ user?.vipLevel || 0 }}</span>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: '20%' }"></div>
        </div>
        <span class="vip-label">VIP{{ (user?.vipLevel || 0) + 1 }}</span>
      </div>
      <p class="vip-hint">{{ t('profile.vipHint') }}</p>
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

    <!-- 2b: Quick Menu Icons Grid -->
    <div class="quick-menu-section">
      <div class="quick-menu-grid">
        <div class="quick-menu-item" @click="$router.push('/transRecord')">
          <div class="menu-icon-wrapper">
            <van-icon name="records-o" />
          </div>
          <span>{{ t('profile.depositRecord') }}</span>
        </div>
        <div class="quick-menu-item" @click="$router.push('/report')">
          <div class="menu-icon-wrapper">
            <van-icon name="chart-trending-o" />
          </div>
          <span>{{ t('profile.profitReport') }}</span>
        </div>
        <div class="quick-menu-item" @click="$router.push('/orderRecordSummary')">
          <div class="menu-icon-wrapper">
            <van-icon name="bill-o" />
          </div>
          <span>{{ t('profile.transactionRecord') }}</span>
        </div>
        <div class="quick-menu-item" @click="$router.push('/tasks')">
          <div class="menu-icon-wrapper">
            <van-icon name="todo-list-o" />
          </div>
          <span>{{ t('profile.taskCenter') }}</span>
        </div>
        <div class="quick-menu-item" @click="$router.push('/prizeRecord')">
          <div class="menu-icon-wrapper">
            <van-icon name="records" />
          </div>
          <span>{{ t('profile.betRecord') }}</span>
        </div>
        <div class="quick-menu-item" @click="$router.push('/buyBit')">
          <div class="menu-icon-wrapper">
            <van-icon name="shopping-cart-o" />
          </div>
          <span>{{ t('profile.buyCrypto') }}</span>
        </div>
        <div class="quick-menu-item" @click="$router.push('/prizeRecord')">
          <div class="menu-icon-wrapper">
            <van-icon name="gift-o" />
          </div>
          <span>{{ t('profile.prizeDetails') }}</span>
        </div>
      </div>
    </div>

    <!-- 2c: Invite Friends Banner -->
    <div class="invite-banner-section">
      <div class="invite-banner" @click="$router.push('/invite')">
        <span class="invite-text">👥 {{ t('profile.inviteBanner') }}</span>
        <span class="detail-link">{{ t('profile.details') }} &gt;</span>
      </div>
    </div>

    <!-- Menu List with 2d additions -->
    <div class="menu-section">
      <van-cell-group>
        <van-cell :title="t('actions.tasks')" is-link @click="$router.push('/tasks')" icon="todo-list-o" />
        <van-cell :title="t('actions.income')" is-link @click="$router.push('/income')" icon="chart-trending-o" />
        <van-cell :title="t('actions.invite')" is-link @click="$router.push('/invite')" icon="friends-o" />
        <van-cell :title="t('promotions.title')" is-link @click="$router.push('/promotions')" icon="gift-o" />
        <van-cell :title="t('profile.securityCenter')" is-link @click="$router.push('/safeCenter')" icon="shield-o" />
        <van-cell :title="t('profile.agentCooperation')" is-link @click="$router.push('/agentCooperation')" icon="friends-o" />
        <van-cell :title="t('profile.language')" is-link icon="setting-o" :value="currentLang" @click="toggleLanguage" />
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

const { t, locale } = useI18n()
const router = useRouter()
const userStore = useUserStore()
const walletStore = useWalletStore()
const user = computed(() => userStore.user)

const currentLang = computed(() => locale.value === 'zh' ? '简体中文' : 'English')

function toggleLanguage() {
  const newLocale = locale.value === 'zh' ? 'en' : 'zh'
  locale.value = newLocale
  localStorage.setItem('lang', newLocale)
}

function handleLogout() {
  userStore.logout()
  showToast({ message: t('auth.logoutSuccess'), position: 'bottom' })
  router.push('/home')
}
</script>

<style lang="scss" scoped>
.profile-header {
  background: linear-gradient(135deg, #1c1640 0%, #2d1b69 50%, #1c1640 100%);
  padding: 24px 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  border-bottom: 1px solid rgba(167, 139, 250, 0.3);
  box-shadow: 0 8px 32px rgba(124, 58, 237, 0.2);
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

/* 2a: VIP Progress */
.vip-progress-section {
  padding: 12px 16px 0;
}

.vip-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.vip-label {
  font-size: 12px;
  font-weight: 600;
  color: $accent-gold;
  white-space: nowrap;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, $accent-gold, #f0c040);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.vip-hint {
  font-size: 11px;
  color: $text-muted;
  margin-top: 6px;
  text-align: center;
}

.balance-section {
  padding: 12px 16px;
}

.balance-card {
  background: linear-gradient(135deg, #1c1640 0%, #2d1b69 50%, #1c1640 100%);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(167, 139, 250, 0.3);
  box-shadow: 0 8px 32px rgba(124, 58, 237, 0.2);
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
  color: #fbbf24;
  text-shadow: 0 0 8px rgba(251, 191, 36, 0.4);
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

/* 2b: Quick Menu Grid */
.quick-menu-section {
  padding: 0 16px 12px;
}

.quick-menu-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  background: $bg-card;
  border-radius: 12px;
  padding: 16px 12px;
}

.quick-menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: opacity 0.2s;

  &:active {
    opacity: 0.7;
  }

  span {
    font-size: 11px;
    color: $text-secondary;
    white-space: nowrap;
  }
}

.menu-icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(108, 92, 231, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;

  .van-icon {
    font-size: 20px;
    color: $accent-purple-light;
  }
}

/* 2c: Invite Banner */
.invite-banner-section {
  padding: 0 16px 12px;
}

.invite-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, rgba(108, 92, 231, 0.2), rgba(168, 85, 247, 0.2));
  border: 1px solid rgba(108, 92, 231, 0.3);
  border-radius: 12px;
  padding: 14px 16px;
  cursor: pointer;
  transition: opacity 0.2s;

  &:active {
    opacity: 0.8;
  }
}

.invite-text {
  font-size: 13px;
  font-weight: 600;
  color: $text-primary;
}

.detail-link {
  font-size: 12px;
  color: $accent-purple-light;
  white-space: nowrap;
}

/* Menu Section */
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
    .van-cell__value {
      color: $text-secondary;
    }
  }
}

.logout-section {
  padding: 0 16px 24px;
}
</style>
