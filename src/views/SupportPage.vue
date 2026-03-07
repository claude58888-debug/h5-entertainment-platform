<template>
  <div class="support-page">
    <div class="support-hero">
      <div class="hero-icon">💬</div>
      <h2>{{ t('support.title') }}</h2>
      <p>24/7 Online Support</p>
    </div>

    <div class="support-options">
      <div class="support-card" v-for="option in options" :key="option.id" @click="handleContact(option)">
        <span class="support-icon">{{ option.icon }}</span>
        <div class="support-info">
          <h3>{{ option.name }}</h3>
          <p>{{ option.desc }}</p>
        </div>
        <span class="arrow">→</span>
      </div>
    </div>

    <div class="faq-section">
      <h3>FAQ</h3>
      <van-collapse v-model="activeFaq">
        <van-collapse-item v-for="faq in faqs" :key="faq.id" :title="faq.q" :name="faq.id">
          {{ faq.a }}
        </van-collapse-item>
      </van-collapse>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { showToast } from 'vant'

const { t } = useI18n()
const activeFaq = ref([])

const options = [
  { id: 'livechat', name: t('support.livechat'), desc: 'Instant response', icon: '💬' },
  { id: 'telegram', name: t('support.telegram'), desc: '@h5play_support', icon: '✈️' },
  { id: 'whatsapp', name: t('support.whatsapp'), desc: '+1 234 567 890', icon: '📱' },
  { id: 'email', name: t('support.email'), desc: 'support@h5play.com', icon: '📧' }
]

const faqs = [
  { id: 1, q: 'How to deposit?', a: 'Go to Deposit page, select payment method, enter amount and submit. Your balance will be updated instantly.' },
  { id: 2, q: 'How long does withdrawal take?', a: 'Withdrawals are typically processed within 1-24 hours depending on the method chosen.' },
  { id: 3, q: 'How to become VIP?', a: 'VIP status is automatically upgraded based on your total deposits and gaming activity.' },
  { id: 4, q: 'Is my data safe?', a: 'We use industry-standard SSL encryption and are licensed by Gaming Curacao to ensure your data safety.' }
]

function handleContact(option) {
  showToast({ message: `Opening ${option.name}...`, position: 'bottom' })
}
</script>

<style lang="scss" scoped>
.support-page {
  padding: 16px;
}

.support-hero {
  text-align: center;
  padding: 32px 0 24px;

  .hero-icon { font-size: 56px; }

  h2 {
    font-size: 22px;
    margin: 12px 0 6px;
  }

  p {
    font-size: 13px;
    color: $text-secondary;
  }
}

.support-options {
  margin-bottom: 32px;
}

.support-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: $bg-card;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 8px;
  cursor: pointer;

  &:active {
    opacity: 0.8;
  }

  .support-icon { font-size: 32px; }

  .support-info {
    flex: 1;

    h3 {
      font-size: 15px;
      margin-bottom: 2px;
    }

    p {
      font-size: 12px;
      color: $text-muted;
    }
  }

  .arrow {
    color: $text-muted;
    font-size: 18px;
  }
}

.faq-section {
  h3 {
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 12px;
  }

  :deep(.van-collapse) {
    border-radius: 12px;
    overflow: hidden;
  }

  :deep(.van-collapse-item) {
    .van-cell {
      background: $bg-card;
      color: $text-primary;
    }

    .van-collapse-item__content {
      background: $bg-card;
      color: $text-secondary;
      font-size: 13px;
    }
  }
}
</style>
