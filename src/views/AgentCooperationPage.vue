<template>
  <div class="agent-page">
    <van-nav-bar title="Agent Cooperation" left-arrow @click-left="$router.back()" fixed :style="{ maxWidth: '480px', margin: '0 auto' }" />
    <div class="page-content" style="padding-top: 46px;">
      <div class="agent-header">
        <span class="agent-icon">🤝</span>
        <h2>Become Our Agent</h2>
        <p>Earn 0.6% commission on every bet from your referrals</p>
      </div>

      <div class="benefit-cards">
        <div class="b-card">
          <span class="b-icon">💰</span>
          <h4>0.6% Commission</h4>
          <p>Earn on every bet your referrals make, no cap</p>
        </div>
        <div class="b-card">
          <span class="b-icon">📊</span>
          <h4>Real-time Tracking</h4>
          <p>Monitor all subordinate activities and earnings</p>
        </div>
        <div class="b-card">
          <span class="b-icon">🔄</span>
          <h4>Daily Settlement</h4>
          <p>Commission settled daily at 8:00 AM</p>
        </div>
        <div class="b-card">
          <span class="b-icon">🎯</span>
          <h4>Multi-tier Rewards</h4>
          <p>Earn from sub-agents you recruit</p>
        </div>
      </div>

      <div class="commission-table">
        <h3>Commission Structure</h3>
        <div class="table-wrap">
          <div class="t-header"><span>Active Users</span><span>Commission Rate</span><span>Monthly Estimate</span></div>
          <div class="t-row"><span>1-10</span><span>0.6%</span><span>~500U</span></div>
          <div class="t-row"><span>11-50</span><span>0.6%</span><span>~3,000U</span></div>
          <div class="t-row"><span>51-200</span><span>0.6%</span><span>~15,000U</span></div>
          <div class="t-row highlight"><span>200+</span><span>0.6% + Bonus</span><span>50,000U+</span></div>
        </div>
      </div>

      <div class="share-section">
        <h3>Share Your Link</h3>
        <div class="share-methods">
          <van-button type="primary" round block @click="share('telegram')">📱 Share via Telegram</van-button>
          <van-button type="success" round block @click="share('whatsapp')">💬 Share via WhatsApp</van-button>
          <van-button round block @click="share('copy')">📋 Copy Invite Link</van-button>
        </div>
      </div>

      <div class="how-it-works">
        <h3>How It Works</h3>
        <div class="steps">
          <div v-for="(s,i) in steps" :key="i" class="step"><span class="step-n">{{ i+1 }}</span><div><h4>{{ s.title }}</h4><p>{{ s.desc }}</p></div></div>
        </div>
      </div>

      <div class="contact-section">
        <h3>Contact Us</h3>
        <p>For partnership inquiries, reach us at:</p>
        <div class="contact-btns">
          <van-button type="primary" round size="small">Telegram: @H5PlayAgent</van-button>
          <van-button round size="small">Email: agent@h5play.com</van-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { showToast } from 'vant'
const steps = [
  { title: 'Apply', desc: 'Register an account and contact our agent support' },
  { title: 'Get Your Link', desc: 'Receive your unique referral link and promotional materials' },
  { title: 'Promote', desc: 'Share your link through Telegram, WhatsApp, social media' },
  { title: 'Earn', desc: 'Earn 0.6% on every bet your referrals place, settled daily' }
]
function share(method) {
  if (method === 'copy') { navigator.clipboard?.writeText('https://h5play.com/invite?code=AGENT001'); showToast({ message: 'Link copied!', type: 'success' }) }
  else showToast({ message: `Opening ${method}...` })
}
</script>

<style lang="scss" scoped>
.page-content { padding: 16px; }
.agent-header { text-align: center; padding: 24px 0; .agent-icon { font-size: 56px; } h2 { font-size: 22px; margin-top: 8px; } p { font-size: 14px; color: $text-secondary; margin-top: 4px; } }
.benefit-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 24px; }
.b-card { background: $bg-card; border-radius: 12px; padding: 16px; text-align: center; .b-icon { font-size: 28px; } h4 { font-size: 13px; margin: 6px 0 4px; } p { font-size: 11px; color: $text-muted; } }
.commission-table { margin-bottom: 24px; h3 { font-size: 16px; font-weight: 700; margin-bottom: 10px; } }
.table-wrap { background: $bg-card; border-radius: 12px; overflow: hidden; }
.t-header { display: grid; grid-template-columns: 1fr 1.2fr 1.2fr; padding: 10px 12px; font-size: 11px; color: $text-muted; border-bottom: 1px solid $border-color; }
.t-row { display: grid; grid-template-columns: 1fr 1.2fr 1.2fr; padding: 10px 12px; font-size: 13px; border-bottom: 1px solid $border-color; &:last-child { border-bottom: none; } &.highlight { background: rgba($accent-gold, 0.1); color: $accent-gold; } }
.share-section { margin-bottom: 24px; h3 { font-size: 16px; font-weight: 700; margin-bottom: 12px; } }
.share-methods { display: flex; flex-direction: column; gap: 8px; }
.how-it-works { margin-bottom: 24px; h3 { font-size: 16px; font-weight: 700; margin-bottom: 12px; } }
.steps { display: flex; flex-direction: column; gap: 10px; }
.step { display: flex; gap: 12px; background: $bg-card; border-radius: 12px; padding: 14px; }
.step-n { width: 28px; height: 28px; border-radius: 50%; background: $accent-purple; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; flex-shrink: 0; }
.step h4 { font-size: 14px; margin-bottom: 2px; }
.step p { font-size: 12px; color: $text-secondary; }
.contact-section { h3 { font-size: 16px; font-weight: 700; margin-bottom: 6px; } p { font-size: 13px; color: $text-secondary; margin-bottom: 10px; } }
.contact-btns { display: flex; flex-wrap: wrap; gap: 8px; }
</style>
