<template>
  <div class="pwd-redpacket-page">
    <van-nav-bar title="Claim Red Packet" left-arrow @click-left="$router.back()" fixed :style="{ maxWidth: '480px', margin: '0 auto' }" />
    <div class="page-content" style="padding-top: 46px;">
      <div class="claim-header">
        <div class="big-packet">🧧</div>
        <h2>Password Red Packet</h2>
        <p>Enter the code to claim your reward</p>
      </div>

      <div class="claim-form">
        <van-field v-model="code" center clearable placeholder="Enter red packet code" class="code-input" maxlength="12">
          <template #button>
            <van-button size="small" type="primary" round @click="claimPacket" :loading="loading">Claim</van-button>
          </template>
        </van-field>
      </div>

      <div class="claim-result" v-if="claimed">
        <div class="result-card">
          <span class="result-icon">🎉</span>
          <span class="result-amount">{{ claimedAmount }} USDT</span>
          <span class="result-text">Turnover: {{ turnoverReq }}x required</span>
        </div>
      </div>

      <div class="claim-history">
        <h3>Claim History</h3>
        <div v-for="i in 2" :key="i" class="history-item">
          <div class="h-left"><span>🧧</span><div><span class="h-code">CODE{{ i }}XYZ</span><span class="h-time">2024-0{{ i }}-10 12:00</span></div></div>
          <span class="h-amount">+{{ (Math.random()*50+5).toFixed(2) }} USDT</span>
        </div>
        <div class="empty-hint" v-if="false">No records yet</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { showToast } from 'vant'
const code = ref('')
const loading = ref(false)
const claimed = ref(false)
const claimedAmount = ref(0)
const turnoverReq = ref(3)

function claimPacket() {
  if (!code.value) { showToast('Please enter code'); return }
  loading.value = true
  setTimeout(() => {
    loading.value = false; claimed.value = true; claimedAmount.value = (Math.random() * 50 + 5).toFixed(2)
    showToast({ message: `Claimed ${claimedAmount.value} USDT!`, type: 'success' })
  }, 1000)
}
</script>

<style lang="scss" scoped>
.page-content { padding: 16px; }
.claim-header { text-align: center; padding: 32px 0 24px; .big-packet { font-size: 72px; } h2 { font-size: 22px; margin-top: 8px; } p { font-size: 13px; color: $text-secondary; margin-top: 4px; } }
.code-input { background: $bg-card; border-radius: 12px; margin-bottom: 20px; }
.claim-result { margin-bottom: 24px; }
.result-card { background: linear-gradient(135deg, #dc2626, #b91c1c); border-radius: 16px; padding: 24px; text-align: center; display: flex; flex-direction: column; gap: 8px; }
.result-icon { font-size: 36px; }
.result-amount { font-size: 28px; font-weight: 700; color: $accent-gold; }
.result-text { font-size: 12px; color: rgba(255,255,255,0.7); }
.claim-history { h3 { font-size: 16px; font-weight: 700; margin-bottom: 12px; } }
.history-item { display: flex; justify-content: space-between; align-items: center; padding: 12px; background: $bg-card; border-radius: 10px; margin-bottom: 8px; }
.h-left { display: flex; align-items: center; gap: 10px; span:first-child { font-size: 24px; } }
.h-code { font-size: 14px; font-weight: 600; display: block; }
.h-time { font-size: 11px; color: $text-muted; }
.h-amount { color: $accent-gold; font-weight: 600; }
</style>
