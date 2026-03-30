<template>
  <div class="support-page">
    <!-- Hero -->
    <div class="support-hero">
      <div class="hero-glow"></div>
      <div class="hero-icon-wrap">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 18v-6a9 9 0 0118 0v6"/><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/></svg>
      </div>
      <h2>{{ t('support.title') }}</h2>
      <p class="hero-sub">{{ t('support.heroSub') }}</p>
    </div>

    <!-- Working Hours -->
    <div class="hours-card">
      <div class="hours-status">
        <span class="status-dot online"></span>
        <span class="status-text">{{ t('support.currentOnline') }}</span>
      </div>
      <div class="hours-info">
        <div class="hours-row">
          <span class="hours-label">{{ t('support.onlineChat') }}</span>
          <span class="hours-value">{{ t('support.online247') }}</span>
        </div>
        <div class="hours-row">
          <span class="hours-label">Telegram</span>
          <span class="hours-value">{{ t('support.telegramHours') }}</span>
        </div>
        <div class="hours-row">
          <span class="hours-label">{{ t('support.emailReply') }}</span>
          <span class="hours-value">{{ t('support.within24h') }}</span>
        </div>
      </div>
    </div>

    <!-- Contact Options -->
    <div class="section-label">{{ t('support.contactMethods') }}</div>
    <div class="support-options">
      <div class="support-card livechat-card" @click="showChatPanel = true">
        <div class="card-icon livechat-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
        </div>
        <div class="support-info">
          <h3>{{ t('support.livechat') }}</h3>
          <p>{{ t('support.instantResponse') }}</p>
        </div>
        <span class="card-arrow">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </span>
      </div>

      <div class="support-card" @click="openTelegram('@DDYL666')">
        <div class="card-icon tg-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0h-.056zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
        </div>
        <div class="support-info">
          <h3>Telegram 1</h3>
          <p>@DDYL666</p>
        </div>
        <span class="card-arrow">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </span>
      </div>

      <div class="support-card" @click="openTelegram('@DDYL555')">
        <div class="card-icon tg-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0h-.056zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
        </div>
        <div class="support-info">
          <h3>Telegram 2</h3>
          <p>@DDYL555</p>
        </div>
        <span class="card-arrow">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </span>
      </div>

      <div class="support-card" @click="handleContact('email')">
        <div class="card-icon email-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
        </div>
        <div class="support-info">
          <h3>{{ t('support.email') }}</h3>
          <p>support@dd.top</p>
        </div>
        <span class="card-arrow">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </span>
      </div>
    </div>

    <!-- FAQ -->
    <div class="section-label">{{ t('support.faq') }}</div>
    <div class="faq-section">
      <van-collapse v-model="activeFaq">
        <van-collapse-item v-for="faq in faqs" :key="faq.id" :title="faq.q" :name="faq.id">
          {{ faq.a }}
        </van-collapse-item>
      </van-collapse>
    </div>

    <!-- Online Chat Placeholder Panel -->
    <van-popup
      v-model:show="showChatPanel"
      position="bottom"
      round
      :style="{ height: '70vh', maxWidth: '480px', margin: '0 auto' }"
    >
      <div class="chat-panel">
        <div class="chat-header">
          <h3>{{ t('support.onlineSupport') }}</h3>
          <span class="chat-close" @click="showChatPanel = false">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </span>
        </div>
        <div class="chat-messages">
          <div class="chat-msg system">
            <div class="msg-bubble">{{ t('support.welcomeMsg') }}</div>
          </div>
          <div class="chat-msg system">
            <div class="msg-bubble">{{ t('support.waitTimeMsg') }}</div>
          </div>
        </div>
        <div class="chat-input-area">
          <input class="chat-input" :placeholder="t('support.chatPlaceholder')" />
          <button class="chat-send-btn">{{ t('support.send') }}</button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { showToast } from 'vant'

const { t } = useI18n()
const activeFaq = ref([])
const showChatPanel = ref(false)

const faqs = [
  { id: 1, q: t('support.faqDeposit'), a: t('support.faqDepositAnswer') },
  { id: 2, q: t('support.faqWithdraw'), a: t('support.faqWithdrawAnswer') },
  { id: 3, q: t('support.faqVip'), a: t('support.faqVipAnswer') },
  { id: 4, q: t('support.faqSecurity'), a: t('support.faqSecurityAnswer') },
  { id: 5, q: t('support.faqPassword'), a: t('support.faqPasswordAnswer') },
  { id: 6, q: t('support.faqContact'), a: t('support.faqContactAnswer') }
]

function openTelegram(handle) {
  const username = handle.replace('@', '')
  window.open('https://t.me/' + username, '_blank')
}

function handleContact(type) {
  if (type === 'email') {
    showToast({ message: t('support.openingEmail'), position: 'bottom' })
  }
}
</script>

<style lang="scss" scoped>
.support-page {
  padding: 0 16px 24px;
}

.support-hero {
  text-align: center;
  padding: 32px 0 20px;
  position: relative;
  overflow: hidden;

  h2 {
    font-size: 22px;
    font-weight: 800;
    margin: 12px 0 6px;
    background: linear-gradient(135deg, $accent-purple-light, $accent-gold);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

.hero-glow {
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(124, 58, 237, 0.25) 0%, transparent 70%);
  pointer-events: none;
}

.hero-icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 20px;
  background: linear-gradient(135deg, $accent-purple, $accent-purple-glow);
  color: #fff;
  box-shadow: 0 8px 32px rgba(124, 58, 237, 0.4);
  position: relative;
  z-index: 1;
}

.hero-sub {
  font-size: 13px;
  color: $text-secondary;
}

/* Working Hours */
.hours-card {
  background: $bg-card;
  border-radius: 14px;
  border: 1px solid $border-color;
  padding: 16px;
  margin-bottom: 20px;
}

.hours-status {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid $border-color;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4caf50;
  box-shadow: 0 0 6px rgba(76, 175, 80, 0.6);

  &.online {
    animation: pulse-dot 2s infinite;
  }
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.status-text {
  font-size: 13px;
  font-weight: 600;
  color: #4caf50;
}

.hours-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hours-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hours-label {
  font-size: 13px;
  color: $text-secondary;
}

.hours-value {
  font-size: 13px;
  color: $text-primary;
  font-weight: 500;
}

/* Section Label */
.section-label {
  font-size: 15px;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 12px;
}

/* Contact Options */
.support-options {
  margin-bottom: 24px;
}

.support-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: $bg-card;
  padding: 14px 16px;
  border-radius: 12px;
  margin-bottom: 8px;
  cursor: pointer;
  border: 1px solid $border-color;
  transition: transform 0.2s;

  &:active {
    transform: scale(0.98);
  }

  &.livechat-card {
    border-color: rgba(124, 58, 237, 0.3);
    background: linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(124, 58, 237, 0.05));
  }
}

.card-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #fff;

  &.livechat-icon { background: linear-gradient(135deg, $accent-purple, $accent-purple-glow); }
  &.tg-icon { background: linear-gradient(135deg, #0088cc, #0077b5); }
  &.email-icon { background: linear-gradient(135deg, #e17055, #d63031); }
}

.support-info {
  flex: 1;

  h3 {
    font-size: 14px;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 2px;
  }

  p {
    font-size: 12px;
    color: $text-muted;
  }
}

.card-arrow {
  color: $text-muted;
  display: flex;
  flex-shrink: 0;
}

/* FAQ */
.faq-section {
  margin-bottom: 24px;

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
      line-height: 1.6;
    }
  }
}

/* Chat Panel */
.chat-panel {
  height: 70vh;
  display: flex;
  flex-direction: column;
  background: $bg-primary;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid $border-color;

  h3 {
    font-size: 16px;
    font-weight: 700;
    color: $text-primary;
  }
}

.chat-close {
  color: $text-muted;
  cursor: pointer;
  display: flex;
}

.chat-messages {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.chat-msg {
  margin-bottom: 12px;

  &.system .msg-bubble {
    background: $bg-card;
    color: $text-secondary;
    border-radius: 4px 12px 12px 12px;
    max-width: 85%;
  }
}

.msg-bubble {
  display: inline-block;
  padding: 10px 14px;
  font-size: 13px;
  line-height: 1.5;
  border: 1px solid $border-color;
}

.chat-input-area {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid $border-color;
  background: $bg-card;
}

.chat-input {
  flex: 1;
  background: $bg-primary;
  border: 1px solid $border-color;
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 13px;
  color: $text-primary;
  outline: none;

  &::placeholder {
    color: $text-muted;
  }
}

.chat-send-btn {
  background: $accent-purple;
  color: #fff;
  border: none;
  border-radius: 20px;
  padding: 8px 18px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;

  &:active {
    opacity: 0.8;
  }
}
</style>
