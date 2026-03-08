<template>
  <div class="support-page">
    <div class="support-hero">
      <div class="hero-icon">💬</div>
      <h2>{{ t('support.title') }}</h2>
      <p>7×24小时在线客服</p>
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
  { id: 'livechat', name: t('support.livechat'), desc: '即时响应', icon: '💬' },
  { id: 'telegram', name: t('support.telegram'), desc: '@RRYL666', icon: '✈️' },
  { id: 'whatsapp', name: t('support.whatsapp'), desc: '点击联系', icon: '📱' },
  { id: 'email', name: t('support.email'), desc: 'support@rr.top', icon: '📧' }
]

const faqs = [
  { id: 1, q: '如何充值？', a: '进入充值页面，选择支付方式，输入金额并提交。余额将即时更新。' },
  { id: 2, q: '提现需要多久？', a: '提现通常在1-24小时内处理，具体取决于所选方式。' },
  { id: 3, q: '如何成为VIP？', a: 'VIP等级根据您的总充值和游戏活动自动升级。' },
  { id: 4, q: '我的数据安全吗？', a: '我们使用行业标准SSL加密，并获得Gaming Curacao许可，确保您的数据安全。' }
]

function handleContact(option) {
  showToast({ message: `正在打开 ${option.name}...`, position: 'bottom' })
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
