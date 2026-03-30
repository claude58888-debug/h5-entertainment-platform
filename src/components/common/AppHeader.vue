<template>
  <header class="app-header">
    <div class="header-left">
      <router-link to="/home" class="logo">
        <div class="logo-icon">
          <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
            <defs>
              <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#6c5ce7"/>
                <stop offset="100%" style="stop-color:#a855f7"/>
              </linearGradient>
            </defs>
            <path d="M5 32V8L13 24L20 12L27 24L35 8V32" stroke="url(#logoGrad)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          </svg>
        </div>
        <div class="logo-text-wrap">
                    <span class="logo-text-cn">{{ $t('seo.siteName') }}</span>
                    <span class="logo-text-en">DD.TOP</span>
        </div>
      </router-link>
    </div>
    <div class="header-right">
      <template v-if="!userStore.isLoggedIn">
        <button class="btn-login" @click="userStore.showLoginModal = true">{{ $t('common.login') }}</button>
        <router-link to="/register" class="btn-register">{{ $t('common.register') }}</router-link>
      </template>
      <template v-else>
        <div class="balance-display">
          <span class="balance-icon">💰</span>
          <span class="balance-amount">{{ walletStore.balance.toFixed(2) }}</span>
        </div>
        <button class="btn-refresh" @click="walletStore.fetchBalance()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
        </button>
        <router-link to="/deposit" class="btn-deposit">{{ $t('actions.deposit') }}</router-link>
      </template>
      <router-link to="/messages" class="btn-bell">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
        <span v-if="notificationStore.unreadCount > 0" class="bell-badge">{{ notificationStore.unreadCount }}</span>
      </router-link>
      <button class="btn-lang" @click="toggleLocale">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
      </button>
    </div>
  </header>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import { useWalletStore } from '@/stores/wallet'
import { useNotificationStore } from '@/stores/notification'

const { locale } = useI18n()
const userStore = useUserStore()
const walletStore = useWalletStore()
const notificationStore = useNotificationStore()

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
  background: linear-gradient(90deg, #110d28 0%, #1c1040 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  z-index: 100;
  border-bottom: 1px solid rgba(124, 58, 237, 0.3);
  box-shadow: 0 2px 20px rgba(124, 58, 237, 0.15);
}

.header-left {
  .logo {
    display: flex;
    align-items: center;
    gap: 6px;
  }
}

.logo-icon {
  display: flex;
  align-items: center;
}

.logo-text-wrap {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.logo-text-cn {
  font-size: 15px;
  font-weight: 700;
  background: linear-gradient(135deg, #a855f7, #6c5ce7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-text-en {
  font-size: 9px;
  color: $text-muted;
  letter-spacing: 1px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-login {
  padding: 4px 14px;
  border: 1px solid rgba($accent-purple-light, 0.5);
  background: transparent;
  color: $accent-purple-light;
  border-radius: 16px;
  font-size: 12px;
  cursor: pointer;
}

.btn-register {
  padding: 5px 14px;
  background: linear-gradient(135deg, #6c5ce7, #a855f7);
  color: #fff;
  border-radius: 16px;
  font-size: 12px;
}

.balance-display {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 16px;
  padding: 4px 10px;
}

.balance-icon {
  font-size: 14px;
}

.balance-amount {
  font-size: 13px;
  font-weight: 600;
  color: #10b981;
}

.btn-refresh {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid $border-color;
  background: transparent;
  color: $text-secondary;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s;

  &:active {
    transform: rotate(180deg);
  }
}

.btn-deposit {
  padding: 5px 16px;
  background: linear-gradient(135deg, #6c5ce7, #a855f7);
  color: #fff;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 600;
}

.btn-bell {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid $border-color;
  background: transparent;
  color: $text-secondary;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: color 0.2s;

  &:hover {
    color: $accent-purple-light;
  }
}

.bell-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  background: $accent-red;
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  line-height: 1;
}

.btn-lang {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid $border-color;
  background: transparent;
  color: $text-secondary;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
