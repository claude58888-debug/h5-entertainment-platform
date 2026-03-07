<template>
  <div class="buy-crypto-page">
    <van-nav-bar title="Buy Crypto" left-arrow @click-left="$router.back()" fixed :style="{ maxWidth: '480px', margin: '0 auto' }" />
    <div class="page-content" style="padding-top: 46px;">
      <div class="crypto-header">
        <h2>Buy USDT</h2>
        <p>Purchase USDT through trusted exchanges</p>
      </div>

      <div class="exchange-list">
        <div v-for="ex in exchanges" :key="ex.name" class="exchange-card" @click="openExchange(ex.url)">
          <div class="ex-left">
            <span class="ex-icon">{{ ex.icon }}</span>
            <div>
              <h4>{{ ex.name }}</h4>
              <p>{{ ex.desc }}</p>
            </div>
          </div>
          <van-button size="small" type="primary" round>Visit</van-button>
        </div>
      </div>

      <div class="tutorial-section">
        <h3>How to Buy USDT</h3>
        <div class="steps">
          <div v-for="(step, i) in steps" :key="i" class="step-item">
            <span class="step-num">{{ i + 1 }}</span>
            <div class="step-content">
              <h4>{{ step.title }}</h4>
              <p>{{ step.desc }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="vpn-section">
        <h3>🔒 VPN Recommended</h3>
        <p>For best experience, use a VPN to access crypto exchanges.</p>
        <div class="vpn-btns">
          <van-button type="primary" round size="small" @click="showToast('Opening VPN...')">Download VPN</van-button>
        </div>
      </div>

      <div class="tips-section">
        <h3>Tips</h3>
        <div class="tips-box">
          <p>• Only send USDT via TRC-20 network</p>
          <p>• Deposits typically confirm in 1-5 minutes</p>
          <p>• Minimum deposit: 10 USDT</p>
          <p>• Do not send other tokens to USDT address</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { showToast } from 'vant'
const exchanges = [
  { name: 'Huobi', icon: '🟢', url: 'https://huobi.com', desc: 'Global crypto exchange' },
  { name: 'Binance', icon: '🟡', url: 'https://binance.com', desc: "World's largest exchange" },
  { name: 'OKX', icon: '⚫', url: 'https://okx.com', desc: 'Professional trading platform' },
  { name: 'ZB', icon: '🔵', url: 'https://zb.com', desc: 'Reliable crypto exchange' }
]
const steps = [
  { title: 'Register Account', desc: 'Sign up on any exchange above with phone/email' },
  { title: 'Complete KYC', desc: 'Verify your identity for higher limits' },
  { title: 'Buy USDT', desc: 'Purchase USDT using bank transfer, card, or P2P' },
  { title: 'Withdraw to Platform', desc: 'Send USDT via TRC-20 to your deposit address' }
]
function openExchange(url) { window.open(url, '_blank') }
</script>

<style lang="scss" scoped>
.page-content { padding: 16px; }
.crypto-header { margin-bottom: 20px; h2 { font-size: 22px; } p { font-size: 13px; color: $text-secondary; margin-top: 4px; } }
.exchange-list { margin-bottom: 24px; }
.exchange-card { display: flex; align-items: center; justify-content: space-between; background: $bg-card; border-radius: 12px; padding: 16px; margin-bottom: 8px; cursor: pointer; }
.ex-left { display: flex; align-items: center; gap: 12px; h4 { font-size: 15px; } p { font-size: 12px; color: $text-muted; } }
.ex-icon { font-size: 32px; }
.tutorial-section { margin-bottom: 24px; h3 { font-size: 16px; font-weight: 700; margin-bottom: 14px; } }
.steps { display: flex; flex-direction: column; gap: 12px; }
.step-item { display: flex; gap: 12px; background: $bg-card; border-radius: 12px; padding: 14px; }
.step-num { width: 28px; height: 28px; border-radius: 50%; background: $accent-purple; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; flex-shrink: 0; }
.step-content { h4 { font-size: 14px; margin-bottom: 2px; } p { font-size: 12px; color: $text-secondary; } }
.vpn-section { background: $bg-card; border-radius: 12px; padding: 16px; margin-bottom: 20px;
  h3 { font-size: 15px; margin-bottom: 6px; }
  p { font-size: 13px; color: $text-secondary; margin-bottom: 10px; }
}
.tips-section { h3 { font-size: 16px; font-weight: 700; margin-bottom: 10px; } }
.tips-box { background: $bg-card; border-radius: 12px; padding: 16px; p { font-size: 13px; color: $text-secondary; line-height: 2; } }
</style>
