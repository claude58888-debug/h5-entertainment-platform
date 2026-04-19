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
        <span class="balance-amount num-mono">{{ formattedBalance }} <span class="balance-currency">USDT</span></span>
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
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useWalletStore } from '@/stores/wallet'
import { showToast } from 'vant'

const { t } = useI18n()
const walletStore = useWalletStore()
const amount = ref('')
const activeMethod = ref('usdt')
const loading = ref(false)

const formattedBalance = computed(() => {
  const value = Number(walletStore.balance) || 0
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
})

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
  background: $bg-card;
  border: 1px solid $border-subtle;
  border-radius: $radius-lg;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 20px;
}

.balance-label {
  font-size: 12px;
  color: $text-muted;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.balance-amount {
  font-size: 26px;
  font-weight: 700;
  color: $text-primary;
  letter-spacing: 0.5px;
}

.balance-currency {
  font-size: 13px;
  font-weight: 600;
  color: $text-muted;
  margin-left: 4px;
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
  background: $bg-card;
  border: 1px solid $border-subtle;
  text-align: center;
  font-size: 12px;
  color: $text-secondary;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  transition: border-color 0.15s ease, color 0.15s ease;

  &.active {
    border-color: $accent-gold;
    color: $text-primary;
    background: $bg-card-hover;
  }
}

.method-icon {
  font-size: 22px;
}

.amount-input {
  background: $bg-card;
  border-radius: $radius-md;
  margin-bottom: 12px;
}

.quick-amounts {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.quick-btn {
  padding: 6px 14px;
  border-radius: $radius-md;
  background: $bg-card;
  border: 1px solid $border-subtle;
  font-size: 12px;
  font-weight: 600;
  color: $text-secondary;
  cursor: pointer;
  transition: all 0.15s ease;

  &:active {
    background: $bg-card-hover;
    color: $accent-gold;
    border-color: rgba(212, 168, 67, 0.3);
  }
}

.amount-tip {
  margin-top: 8px;
  font-size: 11px;
  color: $text-muted;
}

.submit-btn {
  margin-top: 8px;
}
</style>
