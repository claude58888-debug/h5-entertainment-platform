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
          <p class="reward-text">{{ t('invite.rewardPerFriend') }}</p>
          <p class="reward-sub">{{ t('invite.rewardSubtext') }}</p>
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
            <p class="qr-hint">{{ t('invite.scanToInvite') }}</p>
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
            {{ t('invite.shareLink') }}
          </van-button>
          <van-button round block class="share-btn telegram-btn" @click="shareTelegram">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
            {{ t('invite.shareTelegram') }}
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
          <span class="stat-label">{{ t('invite.activeFriends') }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-icon">💰</span>
          <span class="stat-num">1,280</span>
          <span class="stat-label">{{ t('invite.totalCommission') }}</span>
        </div>
      </div>

      <!-- Commission Structure -->
      <div class="commission-section">
        <h3>{{ t('invite.commissionStructure') }}</h3>
        <div class="commission-list">
          <div class="commission-item">
            <div class="commission-level level-1">1</div>
            <div class="commission-info">
              <span class="commission-name">{{ t('invite.level1') }}</span>
              <span class="commission-rate">{{ t('invite.level1Rate') }}</span>
            </div>
            <div class="commission-bar"><div class="bar-fill" style="width: 100%"></div></div>
          </div>
          <div class="commission-item">
            <div class="commission-level level-2">2</div>
            <div class="commission-info">
              <span class="commission-name">{{ t('invite.level2') }}</span>
              <span class="commission-rate">{{ t('invite.level2Rate') }}</span>
            </div>
            <div class="commission-bar"><div class="bar-fill" style="width: 50%"></div></div>
          </div>
          <div class="commission-item">
            <div class="commission-level level-3">3</div>
            <div class="commission-info">
              <span class="commission-name">{{ t('invite.level3') }}</span>
              <span class="commission-rate">{{ t('invite.level3Rate') }}</span>
            </div>
            <div class="commission-bar"><div class="bar-fill" style="width: 17%"></div></div>
          </div>
        </div>
      </div>

      <!-- Referral List -->
      <div class="referral-section">
        <h3>{{ t('invite.inviteRecord') }}</h3>
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
              <span class="referral-status" :class="friend.active ? 'active' : 'inactive'">{{ friend.active ? t('invite.active') : t('invite.inactive') }}</span>
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
import { ref, computed } from 'vue'
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

const rules = computed(() => [
  { title: t('invite.step1Title'), desc: t('invite.step1Desc') },
  { title: t('invite.step2Title'), desc: t('invite.step2Desc') },
  { title: t('invite.step3Title'), desc: t('invite.step3Desc') },
  { title: t('invite.step4Title'), desc: t('invite.step4Desc') }
])

function copyCode() {
  navigator.clipboard?.writeText('ABC123')
  showToast({ message: t('invite.copied'), position: 'bottom' })
}

function copyLink() {
  navigator.clipboard?.writeText('https://h5play.com/r/ABC123')
  showToast({ message: t('invite.copied'), position: 'bottom' })
}

function shareTelegram() {
  const text = encodeURIComponent('Join me on this amazing platform! Use my invite code: ABC123')
  const url = encodeURIComponent('https://h5play.com/r/ABC123')
  window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank')
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
  display: flex;
  flex-direction: column;
  gap: 10px;

  .share-btn {
    background: linear-gradient(135deg, $accent-gold, #d97706) !important;
    border: none !important;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;

    &.telegram-btn {
      background: linear-gradient(135deg, #0088cc, #006699) !important;
    }
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

/* Commission Structure */
.commission-section {
  margin-bottom: 20px;

  h3 {
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 12px;
  }
}

.commission-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.commission-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: $bg-card;
  border-radius: 12px;
  padding: 14px;
}

.commission-level {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;

  &.level-1 {
    background: linear-gradient(135deg, $accent-gold, #d97706);
    color: #000;
  }

  &.level-2 {
    background: linear-gradient(135deg, #a78bfa, $accent-purple);
    color: #fff;
  }

  &.level-3 {
    background: linear-gradient(135deg, #6b7280, #4b5563);
    color: #fff;
  }
}

.commission-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.commission-name {
  font-size: 13px;
  font-weight: 600;
}

.commission-rate {
  font-size: 12px;
  color: $accent-gold;
}

.commission-bar {
  width: 60px;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, $accent-gold, #d97706);
  border-radius: 3px;
  transition: width 0.3s ease;
}
</style>
