<template>
  <div class="error-page" role="main" :aria-label="t('errors.networkError')">
    <div class="error-icon">
      <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="rgba(124,58,237,0.4)" stroke-width="1.5">
        <path d="M1 1l22 22"/>
        <path d="M16.72 11.06A10.94 10.94 0 0119 12.55"/>
        <path d="M5 12.55a10.94 10.94 0 015.17-2.39"/>
        <path d="M10.71 5.05A16 16 0 0122.56 9"/>
        <path d="M1.42 9a15.91 15.91 0 014.7-2.88"/>
        <path d="M8.53 16.11a6 6 0 016.95 0"/>
        <line x1="12" y1="20" x2="12.01" y2="20"/>
      </svg>
    </div>
    <h1 class="error-code">{{ t('errors.networkError') }}</h1>
    <p class="error-title">{{ t('errors.cannotConnect') }}</p>
    <p class="error-desc">{{ t('errors.checkNetwork') }}</p>
    <van-button type="primary" round @click="retry" class="error-btn">
      {{ t('common.reload') }}
    </van-button>
    <van-button plain round @click="$router.push('/home')" class="error-btn-secondary">
      {{ t('common.backToHome') }}
    </van-button>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

function retry() {
  window.location.reload()
}
</script>

<style lang="scss" scoped>
.error-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  padding: 40px 20px;
  text-align: center;
}

.error-icon {
  margin-bottom: 20px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.error-code {
  font-size: 28px;
  font-weight: 800;
  color: #ef4444;
  margin-bottom: 8px;
}

.error-title {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 8px;
}

.error-desc {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 32px;
}

.error-btn {
  min-width: 160px;
  margin-bottom: 12px;
}

.error-btn-secondary {
  min-width: 160px;
  color: rgba(255, 255, 255, 0.6) !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
}
</style>
