<template>
  <div class="responsible-gaming-page">
    <van-nav-bar :title="t('responsibleGaming.title')" left-arrow @click-left="$router.back()" />

    <div class="page-content">
      <div class="hero-section">
        <div class="hero-icon">🛡️</div>
        <h2>{{ t('responsibleGaming.title') }}</h2>
        <p>{{ t('responsibleGaming.heroDesc') }}</p>
      </div>

      <div class="info-card">
        <h3>{{ t('responsibleGaming.whatIs') }}</h3>
        <p>{{ t('responsibleGaming.whatIsDesc') }}</p>
      </div>

      <div class="tools-section">
        <h3>{{ t('responsibleGaming.ourTools') }}</h3>

        <div class="tool-card" @click="$router.push('/limits')">
          <span class="tool-icon">💰</span>
          <div class="tool-info">
            <h4>{{ t('responsibleGaming.depositLimits') }}</h4>
            <p>{{ t('responsibleGaming.depositLimitsDesc') }}</p>
          </div>
          <span class="arrow">→</span>
        </div>

        <div class="tool-card" @click="$router.push('/self-exclusion')">
          <span class="tool-icon">🚫</span>
          <div class="tool-info">
            <h4>{{ t('responsibleGaming.selfExclusion') }}</h4>
            <p>{{ t('responsibleGaming.selfExclusionDesc') }}</p>
          </div>
          <span class="arrow">→</span>
        </div>
      </div>

      <div class="tips-section">
        <h3>{{ t('responsibleGaming.safeTips') }}</h3>
        <div class="tip-list">
          <div class="tip-item" v-for="tip in tips" :key="tip.id">
            <span class="tip-number">{{ tip.id }}</span>
            <p>{{ tip.text }}</p>
          </div>
        </div>
      </div>

      <div class="warning-signs">
        <h3>{{ t('responsibleGaming.warningSigns') }}</h3>
        <ul>
          <li>{{ t('responsibleGaming.warning1') }}</li>
          <li>{{ t('responsibleGaming.warning2') }}</li>
          <li>{{ t('responsibleGaming.warning3') }}</li>
          <li>{{ t('responsibleGaming.warning4') }}</li>
          <li>{{ t('responsibleGaming.warning5') }}</li>
          <li>{{ t('responsibleGaming.warning6') }}</li>
        </ul>
      </div>

      <div class="help-section">
        <h3>{{ t('responsibleGaming.needHelp') }}</h3>
        <p>{{ t('responsibleGaming.needHelpDesc') }}</p>
        <div class="help-contacts">
          <div class="help-item">
            <span class="help-icon">📞</span>
            <div>
              <strong>{{ t('responsibleGaming.gamblingHotline') }}</strong>
              <p>1-800-522-4700</p>
            </div>
          </div>
          <div class="help-item">
            <span class="help-icon">💬</span>
            <div>
              <strong>{{ t('responsibleGaming.onlineSupport') }}</strong>
              <p>support@h5entertainment.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const tips = [
  { id: 1, text: t('responsibleGaming.tip1') },
  { id: 2, text: t('responsibleGaming.tip2') },
  { id: 3, text: t('responsibleGaming.tip3') },
  { id: 4, text: t('responsibleGaming.tip4') },
  { id: 5, text: t('responsibleGaming.tip5') },
  { id: 6, text: t('responsibleGaming.tip6') }
]
</script>

<style lang="scss" scoped>
.responsible-gaming-page {
  min-height: 100vh;
  background: $bg-primary;
}

.page-content {
  padding: 16px;
}

.hero-section {
  text-align: center;
  padding: 28px 16px;
  margin-bottom: 16px;

  .hero-icon { font-size: 48px; margin-bottom: 10px; }
  h2 { font-size: 20px; margin-bottom: 6px; }
  p { font-size: 13px; color: $text-secondary; }
}

.info-card {
  background: $bg-card;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;

  h3 { font-size: 15px; font-weight: 600; margin-bottom: 8px; }
  p { font-size: 13px; color: $text-secondary; line-height: 1.6; }
}

.tools-section {
  margin-bottom: 16px;

  h3 { font-size: 15px; font-weight: 600; margin-bottom: 12px; }
}

.tool-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: $bg-card;
  padding: 14px;
  border-radius: 10px;
  margin-bottom: 8px;
  cursor: pointer;

  &:active { opacity: 0.8; }

  .tool-icon { font-size: 28px; }
  .tool-info {
    flex: 1;
    h4 { font-size: 14px; margin-bottom: 2px; }
    p { font-size: 12px; color: $text-muted; }
  }
  .arrow { color: $text-muted; font-size: 16px; }
}

.tips-section {
  margin-bottom: 16px;

  h3 { font-size: 15px; font-weight: 600; margin-bottom: 12px; }
}

.tip-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: $bg-card;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 6px;

  .tip-number {
    background: linear-gradient(135deg, #e6a23c, #f0c040);
    color: #000;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    flex-shrink: 0;
  }

  p { font-size: 13px; color: $text-secondary; line-height: 1.5; }
}

.warning-signs {
  background: rgba(245, 108, 108, 0.1);
  border: 1px solid rgba(245, 108, 108, 0.2);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;

  h3 { font-size: 15px; font-weight: 600; margin-bottom: 10px; color: #f56c6c; }

  ul {
    padding-left: 18px;
    li {
      font-size: 13px;
      color: $text-secondary;
      line-height: 1.8;
    }
  }
}

.help-section {
  background: $bg-card;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;

  h3 { font-size: 15px; font-weight: 600; margin-bottom: 8px; }
  > p { font-size: 13px; color: $text-secondary; margin-bottom: 12px; }
}

.help-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

  &:last-child { border-bottom: none; }

  .help-icon { font-size: 24px; }
  strong { font-size: 14px; display: block; margin-bottom: 2px; }
  p { font-size: 12px; color: $text-muted; }
}
</style>
