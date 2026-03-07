<template>
  <div class="recharge-page">
    <van-nav-bar title="USDT TRC-20" left-arrow @click-left="$router.back()" fixed :style="{ maxWidth: '480px', margin: '0 auto' }" />
    <div class="page-content" style="padding-top: 46px;">
      <div class="balance-card">
        <span class="balance-label">{{ t('wallet.balance') }}</span>
        <span class="balance-amount">{{ walletStore.balance.toFixed(2) }} USDT</span>
      </div>

      <div class="qr-section">
        <h3>{{ t('wallet.depositMethod') }}: USDT TRC-20</h3>
        <div class="qr-box">
          <div class="qr-placeholder">QR</div>
        </div>
        <div class="wallet-address">
          <span class="address-text">TXkG4d...8f9Kz</span>
          <van-button size="small" type="primary" round @click="copyAddress">{{ t('invite.copy') }}</van-button>
        </div>
        <p class="qr-tip">Minimum deposit: 10 USDT. Network: TRC-20 only.</p>
      </div>

      <div class="amount-section">
        <h3>{{ t('wallet.amount') }}</h3>
        <van-field v-model="amount" type="number" :placeholder="t('wallet.amountPlaceholder')" class="amount-input" />
        <div class="quick-amounts">
          <span v-for="a in quickAmounts" :key="a" class="quick-btn" :class="{ active: amount === String(a) }" @click="amount = String(a)">{{ a }}</span>
        </div>
      </div>

      <div class="bonus-info">
        <h3>First Deposit Bonus</h3>
        <div class="bonus-table">
          <div class="bonus-row" v-for="b in bonusTiers" :key="b.deposit">
            <span>Deposit {{ b.deposit }}U</span>
            <span class="bonus-val">+{{ b.bonus }}U</span>
          </div>
        </div>
        <p class="bonus-tip">3x turnover required to withdraw bonus</p>
      </div>

      <van-button type="primary" round block size="large" :loading="loading" @click="onSubmit" class="submit-btn">
        {{ t('wallet.submitDeposit') }}
      </van-button>

      <div class="history-section">
        <h3>Recent Deposits</h3>
        <div v-for="i in 3" :key="i" class="history-item">
          <div class="item-left">
            <span class="item-type">USDT TRC-20</span>
            <span class="item-time">2024-0{{ i }}-15 14:30</span>
          </div>
          <span class="item-amount success">+{{ (Math.random() * 1000 + 100).toFixed(2) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useWalletStore } from '@/stores/wallet'
import { showToast } from 'vant'

const { t } = useI18n()
const walletStore = useWalletStore()
const amount = ref('')
const loading = ref(false)
const quickAmounts = [100, 500, 1000, 2000, 5000, 10000]
const bonusTiers = [
  { deposit: 100, bonus: 8 }, { deposit: 500, bonus: 28 }, { deposit: 1000, bonus: 68 },
  { deposit: 2000, bonus: 118 }, { deposit: 5000, bonus: 258 }, { deposit: 10000, bonus: 588 }
]

function copyAddress() {
  navigator.clipboard?.writeText('TXkG4dABCDEF1234567890abcdef8f9Kz')
  showToast({ message: t('invite.copied'), position: 'bottom' })
}

async function onSubmit() {
  if (!amount.value || Number(amount.value) < 10) { showToast({ message: 'Min 10 USDT', type: 'fail' }); return }
  loading.value = true
  try { await walletStore.deposit(amount.value); showToast({ message: t('common.success'), type: 'success' }); amount.value = '' }
  catch { showToast({ message: t('common.error'), type: 'fail' }) }
  finally { loading.value = false }
}
</script>

<style lang="scss" scoped>
.page-content { padding: 16px; }
.balance-card { background: linear-gradient(135deg, $accent-purple, #4c1d95); border-radius: 16px; padding: 20px; margin-bottom: 20px; }
.balance-label { font-size: 13px; color: rgba(255,255,255,0.7); display: block; }
.balance-amount { font-size: 28px; font-weight: 700; }
.qr-section { background: $bg-card; border-radius: 12px; padding: 20px; margin-bottom: 20px; text-align: center;
  h3 { font-size: 14px; margin-bottom: 16px; text-align: left; }
}
.qr-box { margin: 0 auto 12px; }
.qr-placeholder { width: 160px; height: 160px; background: #fff; border-radius: 12px; margin: 0 auto; display: flex; align-items: center; justify-content: center; color: #333; font-size: 24px; font-weight: 700; }
.wallet-address { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 8px; }
.address-text { font-size: 13px; color: $accent-purple-light; font-family: monospace; }
.qr-tip { font-size: 11px; color: $text-muted; }
.amount-section { margin-bottom: 20px; h3 { font-size: 15px; margin-bottom: 10px; } }
.amount-input { background: $bg-card; border-radius: 10px; margin-bottom: 10px; }
.quick-amounts { display: flex; flex-wrap: wrap; gap: 8px; }
.quick-btn { padding: 6px 16px; border-radius: 16px; background: $bg-card; font-size: 13px; cursor: pointer; &.active { background: $accent-purple; } }
.bonus-info { background: $bg-card; border-radius: 12px; padding: 16px; margin-bottom: 20px;
  h3 { font-size: 14px; margin-bottom: 10px; color: $accent-gold; }
}
.bonus-table { display: flex; flex-direction: column; gap: 6px; }
.bonus-row { display: flex; justify-content: space-between; font-size: 13px; padding: 4px 0; }
.bonus-val { color: $accent-gold; font-weight: 600; }
.bonus-tip { font-size: 11px; color: $text-muted; margin-top: 8px; }
.submit-btn { margin-bottom: 20px; }
.history-section { h3 { font-size: 15px; margin-bottom: 10px; } }
.history-item { display: flex; justify-content: space-between; align-items: center; padding: 12px; background: $bg-card; border-radius: 10px; margin-bottom: 8px; }
.item-left { display: flex; flex-direction: column; gap: 4px; }
.item-type { font-size: 14px; }
.item-time { font-size: 11px; color: $text-muted; }
.item-amount { font-size: 15px; font-weight: 600; &.success { color: #10b981; } }
</style>
