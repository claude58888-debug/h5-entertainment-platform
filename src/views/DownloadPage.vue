<template>
  <div class="download-page">
    <!-- Hero Section -->
    <div class="download-hero">
      <div class="hero-bg-glow"></div>
      <div class="hero-logo">
        <div class="logo-circle">
          <span class="logo-text">DD</span>
        </div>
      </div>
      <h2 class="hero-title">{{ t('download.title') }}</h2>
      <p class="hero-subtitle">{{ t('download.tip') }}</p>
      <p class="hero-version">v2.8.6 | 58.3MB</p>
    </div>

    <!-- QR Code Section -->
    <div class="qr-section">
      <div class="qr-card">
        <div class="qr-box">
          <div class="qr-pattern">
            <div class="qr-corner tl"></div>
            <div class="qr-corner tr"></div>
            <div class="qr-corner bl"></div>
            <div class="qr-inner">
              <span>DD</span>
            </div>
            <div class="qr-dots">
              <div v-for="i in 81" :key="i" class="qr-dot" :class="{ filled: qrDots[i-1] }"></div>
            </div>
          </div>
        </div>
        <p class="qr-hint">{{ t('download.scanQr') }}</p>
      </div>
    </div>

    <!-- Download Buttons -->
    <div class="download-buttons">
      <div class="download-btn android" @click="handleDownload('android')">
        <div class="btn-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85-.29-.15-.65-.06-.83.22l-1.88 3.24c-1.21-.46-2.55-.73-3.96-.73s-2.75.27-3.96.73L6.65 5.67c-.19-.29-.58-.38-.87-.2-.28.18-.37.54-.22.83L7.4 9.48C3.67 11.25 1 14.83 1 18.99h22c0-4.16-2.67-7.74-6.4-9.51zM7 15.25a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5zm10 0a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5z"/></svg>
        </div>
        <div class="btn-info">
          <span class="btn-label">{{ t('download.android') }}</span>
          <span class="btn-req">Android 5.0+</span>
        </div>
        <div class="btn-action">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </div>
      </div>

      <div class="download-btn ios" @click="handleDownload('ios')">
        <div class="btn-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
        </div>
        <div class="btn-info">
          <span class="btn-label">{{ t('download.ios') }}</span>
          <span class="btn-req">iOS 12.0+</span>
        </div>
        <div class="btn-action">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </div>
      </div>
    </div>

    <!-- App Features -->
    <div class="features-section">
      <h3 class="section-title">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        APP特色功能
      </h3>
      <div class="features-grid">
        <div class="feature-item" v-for="feature in features" :key="feature.name">
          <span class="feature-icon">{{ feature.icon }}</span>
          <span class="feature-name">{{ feature.name }}</span>
          <span class="feature-desc">{{ feature.desc }}</span>
        </div>
      </div>
    </div>

    <!-- Installation Guide -->
    <div class="install-section">
      <h3 class="section-title">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
        安装指南
      </h3>
      <div class="install-steps">
        <div class="step-item" v-for="(step, i) in installSteps" :key="i">
          <div class="step-number">{{ i + 1 }}</div>
          <div class="step-content">
            <span class="step-title">{{ step.title }}</span>
            <span class="step-desc">{{ step.desc }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Trust Badges -->
    <div class="trust-section">
      <div class="trust-item">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        <span>安全加密</span>
      </div>
      <div class="trust-item">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        <span>官方正版</span>
      </div>
      <div class="trust-item">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <span>极速下载</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { showToast } from 'vant'

const { t } = useI18n()

const qrDots = Array.from({ length: 81 }, (_, i) => {
  const row = Math.floor(i / 9)
  const col = i % 9
  if ((row < 2 && col < 2) || (row < 2 && col > 6) || (row > 6 && col < 2)) return false
  if (row >= 3 && row <= 5 && col >= 3 && col <= 5) return false
  return (i * 7 + 3) % 3 !== 0
})

const features = [
  { icon: '\uD83C\uDFAE', name: '海量游戏', desc: '1000+热门游戏' },
  { icon: '\uD83D\uDCB0', name: '极速提现', desc: '最快5分钟到账' },
  { icon: '\uD83D\uDD12', name: '安全可靠', desc: 'SSL加密保护' },
  { icon: '\uD83C\uDF81', name: '专属优惠', desc: 'APP独享福利' },
  { icon: '\uD83D\uDCF1', name: '流畅体验', desc: '原生APP性能' },
  { icon: '\uD83D\uDCAC', name: '24/7客服', desc: '全天候服务' }
]

const installSteps = [
  { title: '点击下载按钮', desc: '选择对应系统版本，点击上方下载按钮' },
  { title: '允许安装权限', desc: 'Android用户需在设置中允许"未知来源"安装' },
  { title: '安装应用', desc: '下载完成后，打开安装包进行安装' },
  { title: '登录畅玩', desc: '打开APP，登录账号即可畅享所有游戏' }
]

function handleDownload(platform) {
  showToast({
    message: (platform === 'android' ? 'Android' : 'iOS') + ' 下载即将开始...',
    position: 'bottom'
  })
}
</script>

<style lang="scss" scoped>
.download-page {
  padding: 0 16px 24px;
}

.download-hero {
  text-align: center;
  padding: 32px 0 20px;
  position: relative;
  overflow: hidden;
}

.hero-bg-glow {
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(124, 58, 237, 0.3) 0%, transparent 70%);
  pointer-events: none;
}

.hero-logo {
  margin-bottom: 16px;
  position: relative;
  z-index: 1;
}

.logo-circle {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  background: linear-gradient(135deg, $accent-purple, $accent-purple-glow);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(124, 58, 237, 0.4);
}

.logo-text {
  font-size: 28px;
  font-weight: 900;
  color: #fff;
  letter-spacing: 2px;
}

.hero-title {
  font-size: 22px;
  font-weight: 800;
  background: linear-gradient(135deg, $accent-purple-light, $accent-gold);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 6px;
  position: relative;
  z-index: 1;
}

.hero-subtitle {
  font-size: 13px;
  color: $text-secondary;
  margin-bottom: 4px;
}

.hero-version {
  font-size: 11px;
  color: $text-muted;
}

.qr-section {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.qr-card {
  background: $bg-card;
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  border: 1px solid $border-color;
}

.qr-box {
  width: 160px;
  height: 160px;
  background: #fff;
  border-radius: 12px;
  padding: 10px;
  margin: 0 auto 12px;
}

.qr-pattern {
  width: 100%;
  height: 100%;
  position: relative;
}

.qr-corner {
  position: absolute;
  width: 28px;
  height: 28px;
  border: 4px solid #1a1540;
  border-radius: 4px;

  &::after {
    content: '';
    position: absolute;
    top: 4px;
    left: 4px;
    width: 12px;
    height: 12px;
    background: #1a1540;
    border-radius: 2px;
  }

  &.tl { top: 0; left: 0; }
  &.tr { top: 0; right: 0; }
  &.bl { bottom: 0; left: 0; }
}

.qr-inner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, $accent-purple, $accent-purple-glow);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;

  span {
    font-size: 12px;
    font-weight: 900;
    color: #fff;
  }
}

.qr-dots {
  position: absolute;
  top: 32px;
  left: 32px;
  right: 4px;
  bottom: 4px;
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  gap: 2px;
}

.qr-dot {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 1px;

  &.filled {
    background: #1a1540;
  }
}

.qr-hint {
  font-size: 12px;
  color: $text-muted;
}

.download-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 28px;
}

.download-btn {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  border-radius: 14px;
  cursor: pointer;
  transition: transform 0.2s, opacity 0.2s;

  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }

  &.android {
    background: linear-gradient(135deg, #1b5e20, #2e7d32);
    border: 1px solid rgba(76, 175, 80, 0.3);
  }

  &.ios {
    background: linear-gradient(135deg, #1a1a2e, #2d2d44);
    border: 1px solid rgba(255, 255, 255, 0.15);
  }
}

.btn-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

.btn-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.btn-label {
  font-size: 15px;
  font-weight: 700;
  color: #fff;
}

.btn-req {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
}

.btn-action {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

.features-section {
  margin-bottom: 28px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 14px;
  color: $text-primary;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 16px 8px;
  background: $bg-card;
  border-radius: 12px;
  border: 1px solid $border-color;
  text-align: center;
}

.feature-icon {
  font-size: 28px;
  margin-bottom: 2px;
}

.feature-name {
  font-size: 13px;
  font-weight: 600;
  color: $text-primary;
}

.feature-desc {
  font-size: 10px;
  color: $text-muted;
}

.install-section {
  margin-bottom: 28px;
}

.install-steps {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.step-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 14px 16px;
  background: $bg-card;
  border-radius: 12px;
  border: 1px solid $border-color;
}

.step-number {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, $accent-purple, $accent-purple-glow);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}

.step-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-top: 4px;
}

.step-title {
  font-size: 14px;
  font-weight: 600;
  color: $text-primary;
}

.step-desc {
  font-size: 12px;
  color: $text-muted;
  line-height: 1.4;
}

.trust-section {
  display: flex;
  justify-content: space-around;
  padding: 16px;
  background: $bg-card;
  border-radius: 12px;
  border: 1px solid $border-color;
}

.trust-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: $text-muted;

  svg {
    color: $accent-purple-light;
  }

  span {
    font-size: 11px;
  }
}
</style>
