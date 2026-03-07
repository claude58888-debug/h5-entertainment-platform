<template>
  <div class="download-page">
    <div class="download-hero">
      <div class="hero-icon">📲</div>
      <h2>{{ t('download.title') }}</h2>
      <p>{{ t('download.tip') }}</p>
    </div>

    <div class="download-options">
      <div class="download-card" @click="handleDownload('android')">
        <span class="dl-icon">🤖</span>
        <div class="dl-info">
          <h3>{{ t('download.android') }}</h3>
          <p>Android 5.0+</p>
        </div>
        <van-button type="primary" size="small" round>Download</van-button>
      </div>

      <div class="download-card" @click="handleDownload('ios')">
        <span class="dl-icon">🍎</span>
        <div class="dl-info">
          <h3>{{ t('download.ios') }}</h3>
          <p>iOS 12.0+</p>
        </div>
        <van-button type="primary" size="small" round>Download</van-button>
      </div>
    </div>

    <div class="qr-section">
      <h3>{{ t('download.scanQr') }}</h3>
      <div class="qr-placeholder">
        <div class="qr-box">QR</div>
      </div>
    </div>

    <div class="install-steps">
      <h3>Installation Guide</h3>
      <div class="step" v-for="(step, i) in steps" :key="i">
        <span class="step-num">{{ i + 1 }}</span>
        <span class="step-text">{{ step }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { showToast } from 'vant'

const { t } = useI18n()

const steps = [
  'Click the download button above',
  'Allow installation from unknown sources',
  'Open the downloaded file to install',
  'Login and enjoy all games'
]

function handleDownload(platform) {
  showToast({ message: `${platform} download starting...`, position: 'bottom' })
}
</script>

<style lang="scss" scoped>
.download-page {
  padding: 16px;
}

.download-hero {
  text-align: center;
  padding: 32px 0 24px;

  .hero-icon { font-size: 56px; }

  h2 {
    font-size: 22px;
    margin: 12px 0 6px;
    background: linear-gradient(135deg, $accent-purple-light, $accent-gold);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  p {
    font-size: 13px;
    color: $text-secondary;
  }
}

.download-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 32px;
}

.download-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: $bg-card;
  padding: 16px;
  border-radius: 12px;
  cursor: pointer;

  .dl-icon { font-size: 36px; }

  .dl-info {
    flex: 1;

    h3 {
      font-size: 15px;
      margin-bottom: 2px;
    }

    p {
      font-size: 11px;
      color: $text-muted;
    }
  }
}

.qr-section {
  text-align: center;
  margin-bottom: 32px;

  h3 {
    font-size: 15px;
    margin-bottom: 16px;
  }
}

.qr-placeholder {
  display: flex;
  justify-content: center;
}

.qr-box {
  width: 140px;
  height: 140px;
  background: #fff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
  font-size: 24px;
  font-weight: 700;
}

.install-steps {
  h3 {
    font-size: 15px;
    margin-bottom: 12px;
  }
}

.step {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: $bg-card;
  border-radius: 10px;
  margin-bottom: 8px;
}

.step-num {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: $accent-purple;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
}

.step-text {
  font-size: 13px;
  color: $text-secondary;
}
</style>
