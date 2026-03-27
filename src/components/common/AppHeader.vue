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
                    <span class="logo-text-cn">大大娱乐</span>
                    <span class="logo-text-en">DD.TOP</span>
        </div>
      </router-link>
    </div>
    <div class="header-right">
      <template v-if="!userStore.isLoggedIn">
        <button class="btn-login" @click="userStore.showLoginModal = true">登录</button>
        <router-link to="/register" class="btn-register">注册</router-link>
      </template>
      <template v-else>
        <router-link to="/profile" class="btn-profile">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0112 0v1"/></svg>
        </router-link>
      </template>
      <button class="btn-lang" @click="toggleLocale">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
      </button>
    </div>
  </header>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'

const { locale } = useI18n()
const userStore = useUserStore()

function toggleLocale() {
  const locales = ['zh-CN', 'en', 'vi']
  const idx = locales.indexOf(locale.value)
  const newLocale = locales[(idx + 1) % locales.length]
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

.btn-profile {
  color: $accent-purple-light;
  display: flex;
  align-items: center;
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
