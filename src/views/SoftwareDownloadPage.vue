<template>
  <div class="software-download-page">
    <van-nav-bar title="Software Download" left-arrow @click-left="$router.back()" fixed :style="{ maxWidth: '480px', margin: '0 auto' }" />
    <div class="page-content" style="padding-top: 46px;">
      <div class="section">
        <h3>🔒 VPN Tools</h3>
        <p class="section-desc">Recommended VPNs for secure browsing</p>
        <div class="app-list">
          <div v-for="app in vpnApps" :key="app.name" class="app-card">
            <span class="app-icon">{{ app.icon }}</span>
            <div class="app-info"><h4>{{ app.name }}</h4><p>{{ app.desc }}</p></div>
            <van-button size="small" type="primary" round @click="showToast(app.name + ' download starting...')">Download</van-button>
          </div>
        </div>
      </div>

      <div class="section">
        <h3>💰 Crypto Wallets</h3>
        <p class="section-desc">Store and manage your USDT</p>
        <div class="app-list">
          <div v-for="app in walletApps" :key="app.name" class="app-card">
            <span class="app-icon">{{ app.icon }}</span>
            <div class="app-info"><h4>{{ app.name }}</h4><p>{{ app.desc }}</p></div>
            <van-button size="small" type="primary" round @click="showToast(app.name + ' download starting...')">Download</van-button>
          </div>
        </div>
      </div>

      <div class="section">
        <h3>💬 Communication</h3>
        <p class="section-desc">Stay connected with us</p>
        <div class="app-list">
          <div v-for="app in commApps" :key="app.name" class="app-card">
            <span class="app-icon">{{ app.icon }}</span>
            <div class="app-info"><h4>{{ app.name }}</h4><p>{{ app.desc }}</p></div>
            <van-button size="small" type="primary" round @click="showToast(app.name + ' download starting...')">Download</van-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { showToast } from 'vant'
const vpnApps = [
  { name: 'ExpressVPN', icon: '🛡️', desc: 'Fast & secure VPN service' },
  { name: 'NordVPN', icon: '🔐', desc: 'Privacy focused VPN' },
  { name: 'Surfshark', icon: '🦈', desc: 'Affordable VPN solution' }
]
const walletApps = [
  { name: 'TronLink', icon: '💎', desc: 'Official TRON wallet for TRC-20' },
  { name: 'Trust Wallet', icon: '🔑', desc: 'Multi-chain crypto wallet' },
  { name: 'imToken', icon: '📱', desc: 'Popular mobile wallet' }
]
const commApps = [
  { name: 'Telegram', icon: '✈️', desc: 'Secure messaging platform' },
  { name: 'WhatsApp', icon: '💬', desc: 'Popular messaging app' }
]
</script>

<style lang="scss" scoped>
.page-content { padding: 16px; }
.section { margin-bottom: 24px;
  h3 { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
}
.section-desc { font-size: 12px; color: $text-muted; margin-bottom: 12px; }
.app-list { display: flex; flex-direction: column; gap: 8px; }
.app-card { display: flex; align-items: center; gap: 12px; background: $bg-card; border-radius: 12px; padding: 14px; }
.app-icon { font-size: 32px; flex-shrink: 0; }
.app-info { flex: 1; h4 { font-size: 14px; margin-bottom: 2px; } p { font-size: 12px; color: $text-muted; } }
</style>
