<template>
  <div class="withdraw-page">
    <van-nav-bar
      :title="t('wallet.withdrawTitle')"
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
        <h3>{{ t('wallet.withdrawMethod') }}</h3>
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
        <p class="amount-tip">{{ t('wallet.minAmount') }}: 50 USDT | {{ t('wallet.maxAmount') }}: 50000 USDT</p>
      </div>

      <van-button type="primary" round block size="large" :loading="loading" @click="onSubmit" class="submit-btn">
        {{ t('wallet.submitWithdraw') }}
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
  { id: 'bank', name: t('wallet.bankCard'), icon: '🏦' }
]

async function onSubmit() {
  if (!amount.value || Number(amount.value) < 50) {
    showToast({ message: `${t('wallet.minAmount')}: 50`, type: 'fail' })
    return
  }
  loading.value = true
  try {
    await walletStore.withdraw(amount.value)
    showToast({ message: t('common.success'), type: 'success' })
    amount.value = ''
  } catch (e) {
    showToast({ message: e.message || t('common.error'), type: 'fail' })
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
  background: linear-gradient(135deg, #10b981, #065f46);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
}

.balance-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}

.balance-amount {
  font-size: 28px;
  font-weight: 700;
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
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.method-item {
  padding: 12px;
  border-radius: 10px;
  background: $bg-card;
  text-align: center;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  border: 2px solid transparent;

  &.active {
    border-color: $accent-purple;
  }
}

.method-icon { font-size: 24px; }

.amount-input {
  background: $bg-card;
  border-radius: 10px;
  margin-bottom: 8px;
}

.amount-tip {
  font-size: 11px;
  color: $text-muted;
}

.submit-btn {
  margin-top: 8px;
}
</style>
