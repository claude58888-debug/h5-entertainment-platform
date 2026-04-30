<template>
  <div class="profile-page">
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh" :pulling-text="$t('common.pullRefresh')" :loosing-text="$t('common.releaseRefresh')" :loading-text="$t('common.refreshing')">
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
        <div class="vip-badge" @click="$router.push('/vip')">
          <span class="vip-badge-icon">&#x1F451;</span>
          VIP{{ currentVipLevel }}
        </div>
      </div>
    </div>

    <!-- VIP Level Progress Section -->
    <div class="vip-progress-section" @click="$router.push('/vip')">
      <div class="vip-progress-header">
        <span class="vip-current">VIP{{ currentVipLevel }}</span>
        <span class="vip-xp">{{ vipCurrentXP.toLocaleString() }} / {{ vipRequiredXP.toLocaleString() }} XP</span>
        <span class="vip-next" v-if="currentVipLevel < 10">VIP{{ currentVipLevel + 1 }}</span>
        <span class="vip-next max" v-else>MAX</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: vipProgressPct + '%' }"></div>
      </div>
      <p class="vip-hint" v-if="currentVipLevel < 10 && vipRequiredXP > vipCurrentXP">
        {{ t('vip.depositToUpgrade', { amount: (vipRequiredXP - vipCurrentXP).toLocaleString(), level: currentVipLevel + 1 }) }}
      </p>
      <p class="vip-hint" v-else-if="currentVipLevel < 10">
        {{ t('vip.readyToUpgrade', { level: currentVipLevel + 1 }) }}
      </p>
      <p class="vip-hint max-hint" v-else>{{ t('vip.maxLevel') }}</p>
      <!-- VIP Privileges Preview -->
      <div class="vip-privileges-preview">
        <div class="priv-item" v-for="priv in currentPrivileges" :key="priv.key">
          <span class="priv-icon">{{ priv.icon }}</span>
          <span class="priv-label">{{ t('vip.' + priv.key) }}</span>
        </div>
      </div>
      <div class="vip-view-all">
        <span>{{ t('vip.viewAll') }} &#8594;</span>
      </div>
    </div>

    <!-- VIP Level-Up Notification Animation -->
    <transition name="level-up">
      <div v-if="showLevelUpNotification" class="level-up-overlay" @click="showLevelUpNotification = false">
        <div class="level-up-card">
          <div class="level-up-glow"></div>
          <span class="level-up-crown">&#x1F451;</span>
          <h2>VIP{{ levelUpTarget }}</h2>
          <p>{{ t('vip.levelUp', { level: levelUpTarget }) }}</p>
          <van-button size="small" type="primary" round @click.stop="showLevelUpNotification = false">{{ t('common.confirm') }}</van-button>
        </div>
      </div>
    </transition>

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
        <div class="quick-menu-item" @click="$router.push('/bets')">
          <div class="menu-icon-wrapper">
            <van-icon name="bill-o" />
          </div>
          <span>{{ t('profile.betRecord') }}</span>
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
          <span>{{ t('profile.prizeRecord') }}</span>
        </div>
        <div class="quick-menu-item" @click="$router.push('/buyBit')">
          <div class="menu-icon-wrapper">
            <van-icon name="shopping-cart-o" />
          </div>
          <span>{{ t('profile.buyCrypto') }}</span>
        </div>
        <div class="quick-menu-item" @click="$router.push('/messages')">
          <div class="menu-icon-wrapper">
            <van-icon name="envelop-o" />
            <span v-if="notificationStore.unreadCount > 0" class="menu-badge">{{ notificationStore.unreadCount }}</span>
          </div>
          <span>{{ t('messages.title') }}</span>
        </div>
        <div class="quick-menu-item" @click="$router.push('/safeCenter')">
          <div class="menu-icon-wrapper">
            <van-icon name="setting-o" />
          </div>
          <span>{{ t('profile.settings') }}</span>
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

    <!-- Buy Crypto Quick Entry -->
    <div class="crypto-entry-section">
      <div class="crypto-entry" @click="$router.push('/buyBit')">
        <div class="crypto-entry-left">
          <van-icon name="gold-coin-o" size="20" color="#fbbf24" />
          <div>
            <span class="crypto-entry-title">{{ t('profile.buyCrypto') }}</span>
            <span class="crypto-entry-desc">{{ t('profile.cryptoExchanges') }}</span>
          </div>
        </div>
        <van-icon name="arrow" color="rgba(255,255,255,0.3)" />
      </div>
      <div class="crypto-entry" @click="$router.push('/softwareDownload')">
        <div class="crypto-entry-left">
          <van-icon name="shield-o" size="20" color="#a78bfa" />
          <div>
            <span class="crypto-entry-title">{{ t('profile.vpnRecommend') }}</span>
            <span class="crypto-entry-desc">{{ t('profile.vpnDesc') }}</span>
          </div>
        </div>
        <van-icon name="arrow" color="rgba(255,255,255,0.3)" />
      </div>
    </div>

    <!-- Account Security Section -->
    <div class="section-title">{{ t('profile.accountSecurity') }}</div>
    <div class="menu-section">
      <van-cell-group>
        <van-cell :title="t('security.changePassword')" is-link icon="lock-o" @click="showPasswordDialog = true" />
        <van-cell :title="t('profile.securityCenter')" is-link @click="$router.push('/safeCenter')" icon="shield-o" />
        <van-cell :title="t('security.loginHistory')" is-link icon="clock-o" @click="showLoginHistory = true" />
        <van-cell :title="t('security.bindEmail')" is-link icon="envelop-o" @click="showEmailDialog = true">
          <template #value>
            <span :style="{ color: emailBound ? '#10b981' : '#ef4444', fontSize: '12px' }">{{ emailBound ? boundEmail : t('security.twoFactorDisabled') }}</span>
          </template>
        </van-cell>
        <van-cell :title="t('security.twoFactor')" is-link icon="shield-o" @click="toggle2FA">
          <template #value>
            <span :style="{ color: twoFactorEnabled ? '#10b981' : '#ef4444', fontSize: '12px' }">
              {{ twoFactorEnabled ? t('security.twoFactorEnabled') : t('security.twoFactorDisabled') }}
            </span>
          </template>
        </van-cell>
        <van-cell :title="t('profile.accountChangeRecord')" is-link icon="balance-list-o" @click="showAccountChanges = true" />
      </van-cell-group>
    </div>

    <!-- Menu List with 2d additions -->
    <div class="section-title">{{ t('profile.functionMenu') }}</div>
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

    </van-pull-refresh>

    <!-- Password Change Dialog -->
    <van-dialog v-model:show="showPasswordDialog" :title="t('security.changePassword')" show-cancel-button :before-close="handlePasswordChange">
      <div class="dialog-form">
        <van-field v-model="passwordForm.oldPassword" type="password" :label="t('security.oldPassword')" :placeholder="t('security.enterOldPassword')" />
        <van-field v-model="passwordForm.newPassword" type="password" :label="t('security.newPassword')" :placeholder="t('security.enterNewPassword')" />
        <van-field v-model="passwordForm.confirmPassword" type="password" :label="t('security.confirmPassword')" :placeholder="t('security.reenterPassword')" />
      </div>
    </van-dialog>

    <!-- Email Binding Dialog -->
    <van-dialog v-model:show="showEmailDialog" :title="t('security.bindEmail')" show-cancel-button :before-close="handleBindEmail">
      <div class="dialog-form">
        <van-field v-model="emailForm" type="email" label="Email" :placeholder="t('security.emailPlaceholder')" />
      </div>
    </van-dialog>

    <!-- Login History Popup -->
    <van-popup v-model:show="showLoginHistory" position="bottom" round :style="{ maxHeight: '70vh' }">
      <div class="login-history-popup">
        <div class="popup-header">
          <h3>{{ t('security.loginHistory') }}</h3>
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
          <van-empty v-if="!loginHistoryList.length" :description="t('security.noLoginHistory')" />
        </div>
      </div>
    </van-popup>

    <!-- Account Change Records Popup -->
    <van-popup v-model:show="showAccountChanges" position="bottom" round :style="{ maxHeight: '70vh' }">
      <div class="login-history-popup">
        <div class="popup-header">
          <h3>{{ t('profile.accountChangeRecord') }}</h3>
          <van-icon name="cross" @click="showAccountChanges = false" />
        </div>
        <div class="account-changes-list">
          <div class="change-item" v-for="(item, index) in accountChangeList" :key="index">
            <div class="change-left">
              <div class="change-icon" :style="{ background: item.iconBg }">{{ item.icon }}</div>
              <div class="change-info">
                <div class="change-type">{{ item.type }}</div>
                <div class="change-time">{{ item.time }}</div>
              </div>
            </div>
            <div class="change-amount" :class="{ positive: item.amount > 0 }">
              {{ item.amount > 0 ? '+' : '' }}{{ item.amount.toFixed(2) }} USDT
            </div>
          </div>
          <van-empty v-if="!accountChangeList.length" :description="t('common.noData')" />
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
import { useNotificationStore } from '@/stores/notification'
import { showToast } from 'vant'

const { t, locale } = useI18n()
const router = useRouter()
const userStore = useUserStore()
const walletStore = useWalletStore()
const notificationStore = useNotificationStore()
const user = computed(() => userStore.user)
const profileLoading = ref(true)
const refreshing = ref(false)

const currentLang = computed(() => locale.value === 'zh' ? '简体中文' : 'English')

// VIP Level System
const currentVipLevel = computed(() => user.value?.vipLevel || 0)

const vipLevelRequirements = [
  0, 500, 2000, 5000, 20000, 50000, 100000, 250000, 500000, 1000000, 2000000
]

const vipCurrentXP = computed(() => {
  return user.value?.totalDeposit ?? 0
})

const vipRequiredXP = computed(() => {
  const level = currentVipLevel.value
  if (level >= 10) return vipCurrentXP.value
  return vipLevelRequirements[level + 1] || 999999
})

const vipProgressPct = computed(() => {
  if (currentVipLevel.value >= 10) return 100
  const prevReq = vipLevelRequirements[currentVipLevel.value] || 0
  const nextReq = vipRequiredXP.value
  const range = nextReq - prevReq
  if (range <= 0) return 100
  return Math.min(((vipCurrentXP.value - prevReq) / range) * 100, 100)
})

const vipPrivilegesList = [
  { key: 'upgradeBonus', icon: '\uD83D\uDCB0', minLevel: 1 },
  { key: 'monthlyRedPacket', icon: '\uD83E\uDDE7', minLevel: 1 },
  { key: 'lossRebate', icon: '\uD83D\uDCB8', minLevel: 2 },
  { key: 'fastWithdrawal', icon: '\u26A1', minLevel: 3 },
  { key: 'birthdayGift', icon: '\uD83C\uDF81', minLevel: 4 },
  { key: 'personalManager', icon: '\uD83D\uDC64', minLevel: 5 },
  { key: 'exclusiveEvents', icon: '\uD83C\uDFAA', minLevel: 6 },
  { key: 'higherLimits', icon: '\uD83D\uDCC8', minLevel: 7 },
  { key: 'prioritySupport', icon: '\uD83C\uDFAF', minLevel: 8 },
  { key: 'customGifts', icon: '\uD83C\uDF80', minLevel: 9 }
]

const currentPrivileges = computed(() => {
  return vipPrivilegesList.filter(p => p.minLevel <= currentVipLevel.value).slice(0, 4)
})

// Level-up notification
const showLevelUpNotification = ref(false)
const levelUpTarget = ref(0)

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
      showToast(t('security.fillAllFields'))
      return false
    }
    if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
      showToast(t('security.passwordMismatch'))
      return false
    }
    if (passwordForm.value.newPassword.length < 6) {
      showToast(t('security.passwordTooShort'))
      return false
    }
    showToast({ message: t('security.passwordChanged'), type: 'success' })
    passwordForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' }
    return true
  }
  return true
}

// Email binding
const showEmailDialog = ref(false)
const emailForm = ref('')
const emailBound = ref(false)
const boundEmail = ref('')

function handleBindEmail(action) {
  if (action === 'confirm') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailForm.value)) {
      showToast(t('security.emailInvalid'))
      return false
    }
    emailBound.value = true
    boundEmail.value = emailForm.value.replace(/(.{2}).*(@.*)/, '$1***$2')
    showToast({ message: t('security.emailBound'), type: 'success' })
    return true
  }
  return true
}

// Two-factor auth
const twoFactorEnabled = ref(false)

function toggle2FA() {
  showToast(t('security.twoFactorComingSoon'))
}

// Login history
const showLoginHistory = ref(false)
const loginHistoryList = ref([
  { device: t('profile.chromeBrowser'), ip: '183.xx.xx.42', location: t('profile.shenzhenGuangdong'), time: '2025-03-30 10:25' },
  { device: t('profile.safariMobile'), ip: '120.xx.xx.88', location: t('profile.guangzhouGuangdong'), time: '2025-03-29 18:40' },
  { device: t('profile.androidApp'), ip: '223.xx.xx.15', location: t('profile.shanghai'), time: '2025-03-28 09:12' },
  { device: t('profile.chromeBrowser'), ip: '183.xx.xx.42', location: t('profile.shenzhenGuangdong'), time: '2025-03-27 22:08' },
  { device: t('profile.iosApp'), ip: '36.xx.xx.99', location: t('profile.beijing'), time: '2025-03-26 14:33' }
])

// Account change records
const showAccountChanges = ref(false)
const accountChangeList = ref([
  { type: t('profile.changeDeposit'), icon: '⬆️', iconBg: 'rgba(16, 185, 129, 0.2)', time: '2026-03-29 20:15', amount: 500.00 },
  { type: t('profile.changeBet'), icon: '🎰', iconBg: 'rgba(124, 58, 237, 0.2)', time: '2026-03-29 19:30', amount: -100.00 },
  { type: t('profile.changeWin'), icon: '🏆', iconBg: 'rgba(245, 158, 11, 0.2)', time: '2026-03-29 19:32', amount: 280.00 },
  { type: t('profile.changeCommission'), icon: '💰', iconBg: 'rgba(245, 158, 11, 0.2)', time: '2026-03-29 18:30', amount: 45.60 },
  { type: t('profile.changeWithdraw'), icon: '⬇️', iconBg: 'rgba(239, 68, 68, 0.2)', time: '2026-03-28 20:00', amount: -500.00 },
  { type: t('profile.changeBet'), icon: '🎰', iconBg: 'rgba(124, 58, 237, 0.2)', time: '2026-03-28 16:45', amount: -50.00 },
  { type: t('profile.changeRebate'), icon: '🔄', iconBg: 'rgba(59, 130, 246, 0.2)', time: '2026-03-28 12:00', amount: 23.80 }
])

// Avatar upload placeholder
function onAvatarClick() {
  showToast(t('profile.avatarUploadSoon'))
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

function onRefresh() {
  profileLoading.value = true
  setTimeout(() => {
    profileLoading.value = false
    refreshing.value = false
  }, 300)
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
  background: linear-gradient(135deg, $bg-card 0%, #281850 50%, $bg-card 100%);
  padding: 24px 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  border-bottom: 1px solid $border-gold;
  box-shadow: 0 8px 32px rgba(212, 168, 67, 0.08);
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
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: linear-gradient(135deg, $accent-gold, #b45309);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 12px;
  border-radius: 10px;
  cursor: pointer;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}

.vip-badge-icon {
  font-size: 12px;
}

/* VIP Progress Section */
.vip-progress-section {
  margin: 12px 16px 0;
  background: linear-gradient(135deg, rgba($accent-gold, 0.1), rgba(180, 83, 9, 0.1));
  border: 1px solid rgba($accent-gold, 0.25);
  border-radius: 12px;
  padding: 14px;
  cursor: pointer;
}

.vip-progress-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.vip-current {
  font-size: 14px;
  font-weight: 700;
  color: $accent-gold;
}

.vip-xp {
  font-size: 11px;
  color: $text-muted;
}

.vip-next {
  font-size: 14px;
  font-weight: 700;
  color: $accent-gold-light;

  &.max {
    color: $accent-red;
  }
}

.progress-bar {
  height: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, $accent-gold, $accent-gold-light);
  border-radius: 5px;
  transition: width 0.6s ease;
  box-shadow: 0 0 8px rgba($accent-gold, 0.5);
}

.vip-hint {
  font-size: 11px;
  color: $text-muted;
  margin-top: 6px;
  text-align: center;

  &.max-hint {
    color: $accent-gold;
  }
}

.vip-privileges-preview {
  display: flex;
  justify-content: space-around;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid rgba($accent-gold, 0.15);
}

.priv-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.priv-icon {
  font-size: 20px;
}

.priv-label {
  font-size: 10px;
  color: $text-muted;
  white-space: nowrap;
}

.vip-view-all {
  text-align: center;
  margin-top: 8px;

  span {
    font-size: 11px;
    color: $accent-gold;
    cursor: pointer;
  }
}

/* Level-up animation */
.level-up-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.level-up-card {
  position: relative;
  background: linear-gradient(135deg, #1c1640, #2d1b69);
  border: 2px solid $accent-gold;
  border-radius: 20px;
  padding: 40px 32px;
  text-align: center;
  animation: levelUpBounce 0.6s ease-out;
}

.level-up-glow {
  position: absolute;
  inset: -4px;
  border-radius: 22px;
  background: linear-gradient(135deg, $accent-gold, transparent, $accent-gold);
  opacity: 0.3;
  animation: glowPulse 1.5s ease-in-out infinite;
}

.level-up-crown {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
  animation: crownFloat 2s ease-in-out infinite;
}

.level-up-card h2 {
  font-size: 32px;
  font-weight: 800;
  color: $accent-gold;
  margin-bottom: 8px;
}

.level-up-card p {
  font-size: 14px;
  color: $text-secondary;
  margin-bottom: 20px;
}

@keyframes levelUpBounce {
  0% { transform: scale(0.3); opacity: 0; }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes glowPulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}

@keyframes crownFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.level-up-enter-active {
  transition: all 0.3s ease;
}
.level-up-leave-active {
  transition: all 0.2s ease;
}
.level-up-enter-from, .level-up-leave-to {
  opacity: 0;
}

.balance-section {
  padding: 12px 16px;
}

.balance-card {
  background: linear-gradient(135deg, $bg-card 0%, #281850 50%, $bg-card 100%);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid $border-gold;
  box-shadow: 0 8px 32px rgba(212, 168, 67, 0.08);
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
  color: $accent-gold-light;
  text-shadow: 0 0 10px rgba(212, 168, 67, 0.35);
}

.balance-actions {
  display: flex;
  gap: 10px;
}

.outline-btn {
  background: transparent !important;
  border-color: $accent-gold !important;
  color: $accent-gold-light !important;
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
  background: rgba(212, 168, 67, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  .van-icon {
    font-size: 20px;
    color: $accent-gold-light;
  }
}

.menu-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  background: $accent-red;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

/* 2c: Invite Banner */
.invite-banner-section {
  padding: 0 16px 12px;
}

.invite-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, rgba(212, 168, 67, 0.12), rgba(243, 200, 105, 0.08));
  border: 1px solid $border-gold;
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

/* Crypto Entry Section */
.crypto-entry-section {
  padding: 0 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.crypto-entry {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: $bg-card;
  border-radius: 12px;
  padding: 14px 16px;
  cursor: pointer;
  transition: opacity 0.2s;

  &:active {
    opacity: 0.8;
  }
}

.crypto-entry-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.crypto-entry-title {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: $text-primary;
}

.crypto-entry-desc {
  display: block;
  font-size: 11px;
  color: $text-muted;
  margin-top: 2px;
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

/* Account Change Records */
.account-changes-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.change-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: $bg-card;
  border-radius: 10px;
}

.change-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.change-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.change-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.change-type {
  font-size: 14px;
  color: $text-primary;
}

.change-time {
  font-size: 11px;
  color: $text-muted;
}

.change-amount {
  font-size: 15px;
  font-weight: 600;
  color: $text-secondary;

  &.positive {
    color: $accent-green;
  }
}
</style>
