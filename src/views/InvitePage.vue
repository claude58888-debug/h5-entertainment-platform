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
      <!-- Hero Card with QR -->
      <div class="invite-card">
        <div class="invite-hero">
          <h3>{{ t('invite.reward') }}</h3>
          <p class="reward-text">50 USDT / 好友</p>
          <p class="reward-sub">额外享受下级投注 20% 永久返佣</p>
        </div>

        <!-- QR Code Display -->
        <div class="qr-section">
          <div class="qr-code-wrap">
            <div class="qr-code" ref="qrRef">
              <svg viewBox="0 0 200 200" width="140" height="140">
                <!-- QR code pattern -->
                <rect width="200" height="200" fill="#fff" rx="8"/>
                <rect x="10" y="10" width="50" height="50" rx="4" fill="#1c1640"/>
                <rect x="140" y="10" width="50" height="50" rx="4" fill="#1c1640"/>
                <rect x="10" y="140" width="50" height="50" rx="4" fill="#1c1640"/>
                <rect x="18" y="18" width="34" height="34" rx="2" fill="#fff"/>
                <rect x="148" y="18" width="34" height="34" rx="2" fill="#fff"/>
                <rect x="18" y="148" width="34" height="34" rx="2" fill="#fff"/>
                <rect x="24" y="24" width="22" height="22" rx="2" fill="#7c3aed"/>
                <rect x="154" y="24" width="22" height="22" rx="2" fill="#7c3aed"/>
                <rect x="24" y="154" width="22" height="22" rx="2" fill="#7c3aed"/>
                <!-- data modules -->
                <rect v-for="(m, i) in qrModules" :key="i" :x="m.x" :y="m.y" width="8" height="8" rx="1" fill="#1c1640"/>
                <!-- center logo -->
                <circle cx="100" cy="100" r="18" fill="#7c3aed"/>
                <text x="100" y="106" text-anchor="middle" fill="#fff" font-size="16" font-weight="700">D</text>
              </svg>
            </div>
            <p class="qr-hint">扫码邀请好友</p>
          </div>
        </div>

        <!-- Invite Code & Link -->
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

        <!-- Share Buttons -->
        <div class="share-buttons">
          <van-button round type="primary" block class="share-btn" @click="copyLink">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            分享邀请链接
          </van-button>
        </div>
      </div>

      <!-- Stats Section -->
      <div class="stats-section">
        <div class="stat-card">
          <span class="stat-icon">👥</span>
          <span class="stat-num">12</span>
          <span class="stat-label">{{ t('invite.friends') }}</span>
        </div>
        <div class="stat-card highlight">
          <span class="stat-icon">✅</span>
          <span class="stat-num">8</span>
          <span class="stat-label">活跃好友</span>
        </div>
        <div class="stat-card">
          <span class="stat-icon">💰</span>
          <span class="stat-num">1,280</span>
          <span class="stat-label">佣金 (USDT)</span>
        </div>
      </div>

      <!-- Referral List -->
      <div class="referral-section">
        <h3>邀请记录</h3>
        <div class="referral-list">
          <div v-for="friend in referralList" :key="friend.id" class="referral-item">
            <div class="referral-left">
              <div class="referral-avatar">{{ friend.name.charAt(0) }}</div>
              <div class="referral-info">
                <span class="referral-name">{{ friend.name }}</span>
                <span class="referral-time">{{ friend.time }}</span>
              </div>
            </div>
            <div class="referral-right">
              <span class="referral-earned">+{{ friend.earned }} USDT</span>
              <span class="referral-status" :class="friend.active ? 'active' : 'inactive'">{{ friend.active ? '活跃' : '未活跃' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Rules Section -->
      <div class="rules-section">
        <h3>{{ t('invite.rules') }}</h3>
        <div class="rules-list">
          <div class="rule-item" v-for="(rule, index) in rules" :key="index">
            <div class="rule-step">{{ index + 1 }}</div>
            <div class="rule-content">
              <span class="rule-title">{{ rule.title }}</span>
              <span class="rule-desc">{{ rule.desc }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { showToast } from 'vant'

const { t } = useI18n()

const qrModules = ref([
  { x: 70, y: 14 }, { x: 80, y: 14 }, { x: 90, y: 14 }, { x: 100, y: 14 }, { x: 110, y: 14 }, { x: 120, y: 14 },
  { x: 70, y: 24 }, { x: 100, y: 24 }, { x: 120, y: 24 },
  { x: 70, y: 34 }, { x: 80, y: 34 }, { x: 110, y: 34 }, { x: 120, y: 34 },
  { x: 70, y: 44 }, { x: 90, y: 44 }, { x: 100, y: 44 }, { x: 120, y: 44 },
  { x: 14, y: 70 }, { x: 24, y: 70 }, { x: 44, y: 70 }, { x: 70, y: 70 }, { x: 120, y: 70 }, { x: 148, y: 70 }, { x: 168, y: 70 }, { x: 178, y: 70 },
  { x: 14, y: 80 }, { x: 34, y: 80 }, { x: 44, y: 80 }, { x: 70, y: 80 }, { x: 120, y: 80 }, { x: 148, y: 80 }, { x: 178, y: 80 },
  { x: 14, y: 120 }, { x: 24, y: 120 }, { x: 44, y: 120 }, { x: 70, y: 120 }, { x: 120, y: 120 }, { x: 148, y: 120 }, { x: 168, y: 120 }, { x: 178, y: 120 },
  { x: 70, y: 148 }, { x: 80, y: 148 }, { x: 90, y: 148 }, { x: 100, y: 148 }, { x: 110, y: 148 }, { x: 120, y: 148 },
  { x: 70, y: 158 }, { x: 100, y: 158 }, { x: 120, y: 158 },
  { x: 70, y: 168 }, { x: 80, y: 168 }, { x: 110, y: 168 }, { x: 120, y: 168 },
  { x: 70, y: 178 }, { x: 90, y: 178 }, { x: 100, y: 178 }, { x: 120, y: 178 }
])

const referralList = ref([
  { id: 1, name: '138****5678', time: '2026-03-28', earned: 50, active: true },
  { id: 2, name: '177****9012', time: '2026-03-25', earned: 50, active: true },
  { id: 3, name: '155****3456', time: '2026-03-22', earned: 50, active: true },
  { id: 4, name: '136****7890', time: '2026-03-20', earned: 50, active: false },
  { id: 5, name: '189****1234', time: '2026-03-18', earned: 50, active: true },
  { id: 6, name: '152****5678', time: '2026-03-15', earned: 50, active: false }
])

const rules = [
  { title: '分享邀请链接', desc: '将您的专属邀请链接或邀请码分享给好友' },
  { title: '好友注册充值', desc: '好友通过您的链接注册并完成首次充值' },
  { title: '获得邀请奖励', desc: '每成功邀请一位好友获得50 USDT奖励' },
  { title: '永久返佣', desc: '享受下级好友投注金额20%的永久返佣' }
]

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
}

.invite-hero {
  text-align: center;
  margin-bottom: 16px;

  h3 {
    font-size: 16px;
    margin-bottom: 4px;
    color: rgba(255, 255, 255, 0.8);
  }
}

.reward-text {
  font-size: 28px;
  font-weight: 700;
  color: $accent-gold;
  margin-bottom: 4px;
}

.reward-sub {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.qr-section {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.qr-code-wrap {
  text-align: center;
}

.qr-code {
  background: #fff;
  border-radius: 12px;
  padding: 8px;
  display: inline-block;
}

.qr-hint {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 8px;
}

.invite-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
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

.share-buttons {
  .share-btn {
    background: linear-gradient(135deg, $accent-gold, #d97706) !important;
    border: none !important;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }
}

.stats-section {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
  margin-bottom: 20px;
}

.stat-card {
  background: $bg-card;
  border-radius: 12px;
  padding: 14px 8px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;

  &.highlight {
    border: 1px solid rgba(16, 185, 129, 0.3);
  }
}

.stat-icon {
  font-size: 20px;
}

.stat-num {
  font-size: 22px;
  font-weight: 700;
  color: $accent-purple-light;
}

.stat-label {
  font-size: 11px;
  color: $text-secondary;
}

.referral-section {
  margin-bottom: 20px;

  h3 {
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 12px;
  }
}

.referral-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: $bg-card;
  border-radius: 10px;
  margin-bottom: 8px;
}

.referral-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.referral-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, $accent-purple, $accent-purple-glow);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
}

.referral-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.referral-name {
  font-size: 14px;
}

.referral-time {
  font-size: 11px;
  color: $text-muted;
}

.referral-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.referral-earned {
  font-size: 14px;
  font-weight: 600;
  color: $accent-gold;
}

.referral-status {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 4px;

  &.active {
    color: $accent-green;
    background: rgba(16, 185, 129, 0.1);
  }

  &.inactive {
    color: $text-muted;
    background: rgba(255, 255, 255, 0.05);
  }
}

.rules-section {
  h3 {
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 12px;
  }
}

.rules-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rule-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: $bg-card;
  border-radius: 12px;
  padding: 14px;
}

.rule-step {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, $accent-purple, $accent-purple-glow);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
}

.rule-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.rule-title {
  font-size: 14px;
  font-weight: 600;
}

.rule-desc {
  font-size: 12px;
  color: $text-secondary;
}
</style>
