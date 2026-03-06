<template>
  <div class="invite-page">
    <van-nav-bar
      :title="t('invite.title')"
      left-arrow
      @click-left="$router.back()"
      fixed
      :style="{ maxWidth: '480px', margin: '0 auto' }"
    />
    <div class="page-content" style="padding-top: 46px;">
      <div class="invite-card">
        <h3>{{ t('invite.reward') }}</h3>
        <p class="reward-text">50 USDT per friend</p>
        <div class="invite-info">
          <div class="info-item">
            <span class="info-label">{{ t('invite.code') }}</span>
            <div class="info-value-row">
              <span class="info-value">ABC123</span>
              <van-button size="mini" type="primary" round @click="copyCode">{{ t('invite.copy') }}</van-button>
            </div>
          </div>
          <div class="info-item">
            <span class="info-label">{{ t('invite.link') }}</span>
            <div class="info-value-row">
              <span class="info-value link">https://h5play.com/r/ABC123</span>
              <van-button size="mini" type="primary" round @click="copyLink">{{ t('invite.copy') }}</van-button>
            </div>
          </div>
        </div>
      </div>

      <div class="stats-section">
        <div class="stat-card">
          <span class="stat-num">12</span>
          <span class="stat-label">{{ t('invite.friends') }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-num">600</span>
          <span class="stat-label">{{ t('invite.reward') }} (USDT)</span>
        </div>
      </div>

      <div class="rules-section">
        <h3>{{ t('invite.rules') }}</h3>
        <div class="rules-list">
          <p>1. Share your invite link or code with friends</p>
          <p>2. Friends register using your link/code</p>
          <p>3. Get 50 USDT for each successful referral</p>
          <p>4. Earn 20% commission on friends' bets</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { showToast } from 'vant'

const { t } = useI18n()

function copyCode() {
  navigator.clipboard?.writeText('ABC123')
  showToast({ message: t('invite.copied'), position: 'bottom' })
}

function copyLink() {
  navigator.clipboard?.writeText('https://h5play.com/r/ABC123')
  showToast({ message: t('invite.copied'), position: 'bottom' })
}
</script>

<style lang="scss" scoped>
.page-content {
  padding: 16px;
}

.invite-card {
  background: linear-gradient(135deg, $accent-purple, #4c1d95);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;

  h3 {
    font-size: 16px;
    margin-bottom: 4px;
  }
}

.reward-text {
  font-size: 24px;
  font-weight: 700;
  color: $accent-gold;
  margin-bottom: 16px;
}

.invite-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  .info-label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    display: block;
    margin-bottom: 4px;
  }
}

.info-value-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-value {
  font-size: 14px;
  font-weight: 600;

  &.link {
    font-size: 11px;
    word-break: break-all;
  }
}

.stats-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 24px;
}

.stat-card {
  background: $bg-card;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-num {
  font-size: 24px;
  font-weight: 700;
  color: $accent-purple-light;
}

.stat-label {
  font-size: 12px;
  color: $text-secondary;
}

.rules-section {
  h3 {
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 12px;
  }
}

.rules-list {
  background: $bg-card;
  border-radius: 12px;
  padding: 16px;

  p {
    font-size: 13px;
    color: $text-secondary;
    line-height: 2;
  }
}
</style>
