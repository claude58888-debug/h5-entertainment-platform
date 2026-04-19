<template>
  <header class="app-header">
    <div class="header-left">
      <router-link to="/home" class="logo" :aria-label="$t('seo.siteName')">
        <svg class="logo-icon" width="26" height="26" viewBox="0 0 40 40" fill="none" aria-hidden="true">
          <path d="M5 32V8L13 24L20 12L27 24L35 8V32" stroke="#d4a843" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </svg>
        <span class="logo-text-cn">{{ $t('seo.siteName') }}</span>
      </router-link>
    </div>
    <div class="header-right">
      <template v-if="!userStore.isLoggedIn">
        <button class="btn-login" @click="userStore.showLoginModal = true">{{ $t('common.login') }}</button>
        <router-link to="/register" class="btn-register">{{ $t('common.register') }}</router-link>
      </template>
      <template v-else>
        <router-link to="/deposit" class="balance-pill" :aria-label="$t('actions.deposit')">
          <span class="balance-amount num-mono">{{ formattedBalance }}</span>
          <span class="balance-unit">{{ $t('header.balanceUnit') }}</span>
          <span class="balance-plus" aria-hidden="true">+</span>
        </router-link>
      </template>
      <router-link to="/messages" class="icon-btn" aria-label="Messages">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        <span v-if="notificationStore.unreadCount > 0" class="bell-badge num-mono">{{ notificationStore.unreadCount }}</span>
      </router-link>
      <button class="icon-btn" @click="toggleLocale" aria-label="Language">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
      </button>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import { useWalletStore } from '@/stores/wallet'
import { useNotificationStore } from '@/stores/notification'

const { locale } = useI18n()
const userStore = useUserStore()
const walletStore = useWalletStore()
const notificationStore = useNotificationStore()

// Format like "1,284.52"
const formattedBalance = computed(() => {
  const value = Number(walletStore.balance) || 0
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
})

function toggleLocale() {
  const locales = ['zh', 'en']
  const idx = locales.indexOf(locale.value)
  const newLocale = locales[(idx + 1) % locales.length]
  locale.value = newLocale
  localStorage.setItem('lang', newLocale)
}
</script>

<style lang="scss" scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: $max-width;
  height: $header-height;
  background: $bg-secondary;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  z-index: 100;
  border-bottom: 1px solid $border-subtle;
}

.header-left .logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-icon {
  flex-shrink: 0;
}

.logo-text-cn {
  font-size: 15px;
  font-weight: 700;
  color: $text-primary;
  letter-spacing: 0.5px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-login {
  padding: 5px 14px;
  border: 1px solid $border-subtle;
  background: transparent;
  color: $text-primary;
  border-radius: $radius-md;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.btn-register {
  padding: 5px 14px;
  background: $accent-gold;
  color: #0b1a23;
  border-radius: $radius-md;
  font-size: 12px;
  font-weight: 700;
}

// Stake-style balance pill: "1,284.52 USDT +"
.balance-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 30px;
  padding: 0 4px 0 10px;
  background: $bg-primary;
  border: 1px solid $border-subtle;
  border-radius: $radius-md;
  color: $text-primary;
  line-height: 1;
}

.balance-amount {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.2px;
}

.balance-unit {
  font-size: 11px;
  color: $text-muted;
  font-weight: 600;
}

.balance-plus {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  background: $accent-gold;
  color: #0b1a23;
  border-radius: $radius-sm;
  font-size: 16px;
  font-weight: 700;
  line-height: 1;
}

.icon-btn {
  position: relative;
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: $text-secondary;
  cursor: pointer;

  &:hover { color: $text-primary; }
}

.bell-badge {
  position: absolute;
  top: 0;
  right: 0;
  min-width: 14px;
  height: 14px;
  padding: 0 4px;
  background: $accent-red;
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  border-radius: $radius-pill;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}
</style>
