<template>
  <header class="app-header">
    <div class="header-left">
      <router-link to="/home" class="logo" aria-label="DD Home">
        <div class="logo-mark">
          <span class="logo-mark-text">DD</span>
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

      <router-link to="/messages" class="icon-btn btn-bell" aria-label="Notifications">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 01-3.46 0"/>
        </svg>
        <span v-if="notificationStore.unreadCount > 0" class="bell-badge">{{ notificationStore.unreadCount }}</span>
      </router-link>

      <router-link to="/support" class="icon-btn btn-support" aria-label="Customer Service">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 18v-6a9 9 0 0118 0v6"/>
          <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/>
        </svg>
      </router-link>

      <button class="icon-btn btn-lang" @click="toggleLocale" aria-label="Language">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
        </svg>
      </button>
    </div>
  </header>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import { useNotificationStore } from '@/stores/notification'

const { locale } = useI18n()
const userStore = useUserStore()
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
  background: rgba(10, 14, 26, 0.75);
  backdrop-filter: blur(20px) saturate(160%);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  z-index: 100;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.header-left {
  .logo {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.logo-mark {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: $gold-gradient;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 4px 14px rgba(201, 166, 84, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

.logo-mark-text {
  font-family: $font-mono;
  font-weight: 800;
  font-size: 14px;
  letter-spacing: 0.5px;
  color: #1a1407;
}

.logo-text-wrap {
  display: flex;
  flex-direction: column;
  line-height: 1.05;
}

.logo-text-cn {
  font-size: 15px;
  font-weight: 700;
  background: $gold-gradient;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-text-en {
  font-size: 9px;
  color: $text-muted;
  letter-spacing: 1.5px;
  font-family: $font-mono;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-login {
  padding: 5px 14px;
  border: 1px solid $border-gold;
  background: transparent;
  color: $gold-light;
  border-radius: $radius-pill;
  font-size: 12px;
  cursor: pointer;
  font-weight: 600;
}

.btn-register {
  padding: 6px 14px;
  background: $gold-gradient;
  color: #1a1407;
  border-radius: $radius-pill;
  font-size: 12px;
  font-weight: 700;
  box-shadow: $shadow-gold-soft;
}

.icon-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid $border-color;
  background: rgba(255, 255, 255, 0.04);
  color: $text-secondary;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: color 0.2s, border-color 0.2s, background 0.2s;

  &:hover {
    color: $gold-light;
    border-color: $border-gold;
    background: rgba(201, 166, 84, 0.08);
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
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);
}
</style>
