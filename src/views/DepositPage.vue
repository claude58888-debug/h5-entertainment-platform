<template>
  <div class="deposit-page">
    <van-nav-bar
      :title="t('wallet.depositTitle')"
      left-arrow
      @click-left="$router.back()"
      fixed
      :style="{ maxWidth: '480px', margin: '0 auto' }"
    />
    <div class="page-content" style="padding-top: 46px;">
      <div class="balance-card">
        <span class="balance-label">{{ t('wallet.balance') }}</span>
        <span class="balance-amount">{{ walletStore.balance.toFixed(2) }} USDT</span>
      </div>

      <div class="method-section">
        <h3>{{ t('wallet.depositMethod') }}</h3>
        <div class="method-grid">
          <div
            v-for="m in methods"
            :key="m.id"
            class="method-item"
            :class="{ active: activeMethod === m.id }"
            @click="activeMethod = m.id"
          >
            <span class="method-icon">{{ m.icon }}</span>
            <span>{{ m.name }}</span>
          </div>
        </div>
      </div>

      <div class="amount-section">
        <h3>{{ t('wallet.amount') }}</h3>
        <van-field
          v-model="amount"
          type="number"
          :placeholder="t('wallet.amountPlaceholder')"
          class="amount-input"
        />
        <div class="quick-amounts">
          <span v-for="a in quickAmounts" :key="a" class="quick-btn" @click="amount = String(a)">{{ a }}</span>
        </div>
        <p class="amount-tip">{{ t('wallet.minAmount') }}: 10 USDT | {{ t('wallet.maxAmount') }}: 50000 USDT</p>
      </div>

      <van-button type="primary" round block size="large" :loading="loading" @click="onSubmit" class="submit-btn">
        {{ t('wallet.submitDeposit') }}
      </van-button>
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
const activeMethod = ref('usdt')
const loading = ref(false)

const methods = [
  { id: 'usdt', name: 'USDT-TRC20', icon: '💎' },
  { id: 'bank', name: t('wallet.bankCard'), icon: '🏦' },
  { id: 'alipay', name: 'Alipay', icon: '💳' }
]

const quickAmounts = [100, 500, 1000, 2000, 5000, 10000]

async function onSubmit() {
  if (!amount.value || Number(amount.value) < 10) {
    showToast({ message: `${t('wallet.minAmount')}: 10`, type: 'fail' })
    return
  }
  loading.value = true
  try {
    await walletStore.deposit(amount.value)
    showToast({ message: t('common.success'), type: 'success' })
    amount.value = ''
  } catch (e) {
    showToast({ message: t('common.error'), type: 'fail' })
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.page-content {
  padding: 16px;
}

.balance-card {
  background: $glass-bg;
  border: $glass-border;
  backdrop-filter: blur($glass-blur);
  -webkit-backdrop-filter: blur($glass-blur);
  border-radius: $radius-lg;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 24px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(500px 160px at 20% 0%, rgba(201, 166, 84, 0.18), transparent 70%);
    pointer-events: none;
  }
}

.balance-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}

.balance-amount {
  font-size: 28px;
  font-weight: 700;
  font-family: $font-mono;
  background: $gold-gradient;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
  z-index: 1;
}

.method-section, .amount-section {
  margin-bottom: 24px;

  h3 {
    font-size: 15px;
    margin-bottom: 12px;
  }
}

.method-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.method-item {
  padding: 14px 10px;
  border-radius: $radius-md;
  background: $glass-bg;
  border: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  text-align: center;
  font-size: 12px;
  color: $text-secondary;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;

  &.active {
    border-color: $gold;
    background: rgba(201, 166, 84, 0.12);
    color: $gold-light;
    box-shadow: $shadow-gold-soft;
  }
}

.method-icon { font-size: 24px; }

:deep(.amount-input) {
  background: $glass-bg;
  border: $glass-border;
  backdrop-filter: blur($glass-blur);
  -webkit-backdrop-filter: blur($glass-blur);
  border-radius: $radius-md;
  margin-bottom: 12px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &::after { display: none; }

  &:focus-within {
    border-color: $gold;
    box-shadow: 0 0 0 3px rgba(201, 166, 84, 0.18);
  }

  input {
    color: $text-primary;
    caret-color: $gold-light;
    font-size: 18px;
    font-family: $font-mono;
    font-weight: 600;

    &::placeholder { color: $text-muted; }
  }
}

.quick-amounts {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quick-btn {
  padding: 7px 16px;
  border-radius: $radius-pill;
  background: $glass-bg;
  border: 1px solid rgba(201, 166, 84, 0.2);
  color: $text-secondary;
  font-size: 13px;
  font-family: $font-mono;
  cursor: pointer;
  transition: all 0.2s ease;

  &:active {
    background: $gold-gradient;
    color: #1a1407;
    border-color: $gold;
  }
}

.amount-tip {
  margin-top: 8px;
  font-size: 11px;
  color: $text-muted;
}

.submit-btn {
  margin-top: 8px;
  background: $gold-gradient !important;
  border: none !important;
  color: #1a1407 !important;
  font-weight: 700 !important;
  box-shadow: $shadow-gold !important;
}
</style>
