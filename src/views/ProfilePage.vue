<template>
  <div class="profile-page">
    <!-- Skeleton Loading State -->
    <template v-if="profileLoading">
      <div class="skeleton-header">
        <div class="skeleton-avatar"></div>
        <div class="skeleton-info">
          <div class="skeleton-line" style="width: 100px; height: 18px;"></div>
          <div class="skeleton-line" style="width: 140px; height: 14px; margin-top: 6px;"></div>
          <div class="skeleton-line" style="width: 80px; height: 20px; margin-top: 6px; border-radius: 10px;"></div>
        </div>
      </div>
      <div class="skeleton-balance">
        <div class="skeleton-line" style="width: 60px; height: 14px;"></div>
        <div class="skeleton-line" style="width: 120px; height: 28px; margin-top: 6px;"></div>
        <div style="display:flex;gap:10px;margin-top:12px;">
          <div class="skeleton-line" style="width: 80px; height: 32px; border-radius: 16px;"></div>
          <div class="skeleton-line" style="width: 80px; height: 32px; border-radius: 16px;"></div>
        </div>
      </div>
      <div class="skeleton-menu">
        <div class="skeleton-line" style="width: 100%; height: 44px;" v-for="i in 5" :key="i"></div>
      </div>
    </template>

    <template v-else>
    <div class="profile-header">
      <div class="avatar" @click="onAvatarClick">
        <img :src="user?.avatar || 'https://picsum.photos/100/100?random=60'" alt="avatar" />
        <div class="avatar-overlay">
          <van-icon name="photograph" />
        </div>
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

    <!-- Account Security Section -->
    <div class="section-title">账户安全</div>
    <div class="menu-section">
      <van-cell-group>
        <van-cell title="修改密码" is-link icon="lock-o" @click="showPasswordDialog = true" />
        <van-cell :title="t('profile.securityCenter')" is-link @click="$router.push('/safeCenter')" icon="shield-o" />
        <van-cell title="登录历史" is-link icon="clock-o" @click="showLoginHistory = true" />
      </van-cell-group>
    </div>

    <!-- Menu List with 2d additions -->
    <div class="section-title">功能菜单</div>
    <div class="menu-section">
      <van-cell-group>
        <van-cell :title="t('actions.tasks')" is-link @click="$router.push('/tasks')" icon="todo-list-o" />
        <van-cell :title="t('actions.income')" is-link @click="$router.push('/income')" icon="chart-trending-o" />
        <van-cell :title="t('actions.invite')" is-link @click="$router.push('/invite')" icon="friends-o" />
        <van-cell :title="t('promotions.title')" is-link @click="$router.push('/promotions')" icon="gift-o" />
        <van-cell :title="t('profile.agentCooperation')" is-link @click="$router.push('/agentCooperation')" icon="friends-o" />
        <van-cell :title="t('profile.language')" is-link icon="setting-o" :value="currentLang" @click="toggleLanguage" />
        <van-cell :title="t('profile.help')" is-link @click="$router.push('/support')" icon="question-o" />
        <van-cell :title="t('profile.about')" is-link icon="info-o" />
      </van-cell-group>
    </div>

    <div class="logout-section" v-if="userStore.isLoggedIn">
      <van-button round block type="danger" @click="handleLogout">{{ t('common.logout') }}</van-button>
    </div>
    </template>

    <!-- Password Change Dialog -->
    <van-dialog v-model:show="showPasswordDialog" title="修改密码" show-cancel-button :before-close="handlePasswordChange">
      <div class="dialog-form">
        <van-field v-model="passwordForm.oldPassword" type="password" label="当前密码" placeholder="请输入当前密码" />
        <van-field v-model="passwordForm.newPassword" type="password" label="新密码" placeholder="请输入新密码" />
        <van-field v-model="passwordForm.confirmPassword" type="password" label="确认密码" placeholder="请再次输入新密码" />
      </div>
    </van-dialog>

    <!-- Login History Popup -->
    <van-popup v-model:show="showLoginHistory" position="bottom" round :style="{ maxHeight: '70vh' }">
      <div class="login-history-popup">
        <div class="popup-header">
          <h3>登录历史</h3>
          <van-icon name="cross" @click="showLoginHistory = false" />
        </div>
        <div class="login-history-list">
          <div class="history-item" v-for="(item, index) in loginHistoryList" :key="index">
            <div class="history-info">
              <div class="history-device">{{ item.device }}</div>
              <div class="history-detail">{{ item.ip }} · {{ item.location }}</div>
            </div>
            <div class="history-time">{{ item.time }}</div>
          </div>
          <van-empty v-if="!loginHistoryList.length" description="暂无登录记录" />
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
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
const profileLoading = ref(true)

const currentLang = computed(() => locale.value === 'zh' ? '简体中文' : 'English')

// Password change
const showPasswordDialog = ref(false)
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

function handlePasswordChange(action) {
  if (action === 'confirm') {
    if (!passwordForm.value.oldPassword || !passwordForm.value.newPassword) {
      showToast('请填写完整信息')
      return false
    }
    if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
      showToast('两次密码不一致')
      return false
    }
    if (passwordForm.value.newPassword.length < 6) {
      showToast('密码长度不能少于6位')
      return false
    }
    showToast({ message: '密码修改成功', type: 'success' })
    passwordForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' }
    return true
  }
  return true
}

// Login history
const showLoginHistory = ref(false)
const loginHistoryList = ref([
  { device: 'Chrome 浏览器', ip: '183.xx.xx.42', location: '广东深圳', time: '2025-03-30 10:25' },
  { device: 'Safari 移动版', ip: '120.xx.xx.88', location: '广东广州', time: '2025-03-29 18:40' },
  { device: 'Android APP', ip: '223.xx.xx.15', location: '上海', time: '2025-03-28 09:12' },
  { device: 'Chrome 浏览器', ip: '183.xx.xx.42', location: '广东深圳', time: '2025-03-27 22:08' },
  { device: 'iOS APP', ip: '36.xx.xx.99', location: '北京', time: '2025-03-26 14:33' }
])

// Avatar upload placeholder
function onAvatarClick() {
  showToast('头像上传功能即将开放')
}

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

onMounted(() => {
  setTimeout(() => {
    profileLoading.value = false
  }, 300)
})
</script>

<style lang="scss" scoped>
/* Skeleton loading */
.skeleton-header {
  background: linear-gradient(135deg, #1c1640 0%, #2d1b69 50%, #1c1640 100%);
  padding: 24px 16px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.skeleton-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: $bg-card;
}

.skeleton-info {
  flex: 1;
}

.skeleton-line {
  background: $bg-card;
  border-radius: 4px;
}

.skeleton-balance {
  padding: 12px 16px;

  .skeleton-line {
    display: block;
  }
}

.skeleton-menu {
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 12px;

  .skeleton-line {
    border-radius: 8px;
  }
}

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
  position: relative;
  cursor: pointer;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.avatar-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 24px;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;

  .van-icon {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
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

/* Section Title */
.section-title {
  padding: 16px 16px 8px;
  font-size: 14px;
  font-weight: 600;
  color: $text-secondary;
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

/* Password Dialog */
.dialog-form {
  padding: 8px 0;

  :deep(.van-field) {
    background: $bg-card;

    .van-field__label {
      color: $text-secondary;
      width: 5em;
    }
  }
}

/* Login History Popup */
.login-history-popup {
  padding: 20px 16px;
  min-height: 300px;
}

.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;

  h3 {
    font-size: 16px;
    font-weight: 600;
  }

  .van-icon {
    font-size: 20px;
    color: $text-muted;
    cursor: pointer;
  }
}

.login-history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: $bg-card;
  border-radius: 10px;
}

.history-info {
  flex: 1;
}

.history-device {
  font-size: 14px;
  color: $text-primary;
  margin-bottom: 4px;
}

.history-detail {
  font-size: 12px;
  color: $text-muted;
}

.history-time {
  font-size: 12px;
  color: $text-muted;
  white-space: nowrap;
  margin-left: 12px;
}
</style>
