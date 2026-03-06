<template>
  <header class="app-header">
    <div class="header-left">
      <router-link to="/home" class="logo">
        <span class="logo-icon">🎮</span>
        <span class="logo-text">H5 Play</span>
      </router-link>
    </div>
    <div class="header-right">
      <template v-if="!userStore.isLoggedIn">
        <button class="btn-login" @click="userStore.showLoginModal = true">{{ t('common.login') }}</button>
        <router-link to="/register" class="btn-register">{{ t('common.register') }}</router-link>
      </template>
      <template v-else>
        <span class="balance">💰 {{ walletStore.balance.toFixed(2) }}</span>
      </template>
      <button class="btn-lang" @click="toggleLocale">{{ locale === 'zh-CN' ? 'EN' : '中' }}</button>
    </div>
  </header>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import { useWalletStore } from '@/stores/wallet'

const { t, locale } = useI18n()
const userStore = useUserStore()
const walletStore = useWalletStore()

function toggleLocale() {
  const newLocale = locale.value === 'zh-CN' ? 'en' : 'zh-CN'
  locale.value = newLocale
  localStorage.setItem('locale', newLocale)
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
  background: $bg-header;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  z-index: 100;
  border-bottom: 1px solid $border-color;
}

.header-left {
  .logo {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .logo-icon { font-size: 24px; }
  .logo-text {
    font-size: 18px;
    font-weight: 700;
    background: linear-gradient(135deg, $accent-purple-light, $accent-gold);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-login {
  padding: 4px 12px;
  border: 1px solid $accent-purple;
  background: transparent;
  color: $accent-purple-light;
  border-radius: 16px;
  font-size: 13px;
  cursor: pointer;
}

.btn-register {
  padding: 4px 12px;
  background: $accent-purple;
  color: #fff;
  border-radius: 16px;
  font-size: 13px;
}

.btn-lang {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid $border-color;
  background: transparent;
  color: $text-secondary;
  font-size: 11px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.balance {
  font-size: 13px;
  color: $accent-gold;
  font-weight: 600;
}
</style>
