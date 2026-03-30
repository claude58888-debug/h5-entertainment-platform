<template>
  <div class="income-page">
    <van-nav-bar
      :title="t('income.title')"
      left-arrow
      @click-left="$router.back()"
      fixed
      :style="{ maxWidth: '480px', margin: '0 auto' }"
    />
    <div class="page-content" style="padding-top: 46px;">
      <!-- Total Earnings Card -->
      <div class="income-cards">
        <div class="income-card primary">
          <div class="card-top-row">
            <span class="card-label">{{ t('income.total') }}</span>
            <span class="card-unit">USDT</span>
          </div>
          <span class="card-amount">2,580.00</span>
          <div class="card-sub-row">
            <div class="sub-item">
              <span class="sub-label">{{ t('income.commissionIncome') }}</span>
              <span class="sub-value">1,680.00</span>
            </div>
            <div class="sub-divider"></div>
            <div class="sub-item">
              <span class="sub-label">{{ t('income.rebateIncome') }}</span>
              <span class="sub-value">900.00</span>
            </div>
          </div>
        </div>

        <!-- Status Cards Row -->
        <div class="income-row three-col">
          <div class="income-card status-card">
            <span class="card-label">{{ t('income.today') }}</span>
            <span class="card-amount small">128.50</span>
            <span class="card-trend up">+12.3%</span>
          </div>
          <div class="income-card status-card pending">
            <span class="card-label">{{ t('income.pendingSettlement') }}</span>
            <span class="card-amount small">356.00</span>
            <span class="card-hint">{{ t('income.expectedTomorrow') }}</span>
          </div>
          <div class="income-card status-card">
            <span class="card-label">{{ t('income.withdrawn') }}</span>
            <span class="card-amount small">1,820.00</span>
            <span class="card-trend neutral">{{ t('income.cumulative') }}</span>
          </div>
        </div>
      </div>

      <!-- Period Filter Tabs -->
      <div class="period-tabs">
        <div
          v-for="period in periodTabs"
          :key="period.id"
          class="period-tab"
          :class="{ active: activePeriod === period.id }"
          @click="activePeriod = period.id"
        >
          {{ period.label }}
        </div>
      </div>

      <!-- Withdraw to Balance Button -->
      <div class="withdraw-section">
        <van-button round block type="primary" class="withdraw-btn" @click="showWithdrawPopup = true">
          <van-icon name="cash-back-record" style="margin-right: 6px;" />
          {{ t('income.withdrawToBalance') }}
        </van-button>
      </div>

      <!-- Income Type Tabs -->
      <div class="income-tabs">
        <div
          v-for="tab in incomeTabs"
          :key="tab.id"
          class="income-tab"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </div>
      </div>

      <!-- Income History -->
      <div class="history-section">
        <h3>{{ t('income.history') }}</h3>
        <van-empty v-if="filteredRecords.length === 0" :description="t('income.noRecords')" />
        <div class="history-list">
          <div v-for="record in filteredRecords" :key="record.id" class="history-item">
            <div class="item-left">
              <div class="item-icon" :style="{ background: record.iconBg }">
                <span>{{ record.icon }}</span>
              </div>
              <div class="item-info">
                <span class="item-type">{{ record.type }}</span>
                <span class="item-desc">{{ record.desc }}</span>
                <span class="item-time">{{ record.time }}</span>
              </div>
            </div>
            <div class="item-right">
              <span class="item-amount" :class="{ negative: record.amount < 0 }">{{ record.amount > 0 ? '+' : '' }}{{ record.amount.toFixed(2) }} USDT</span>
              <span class="item-status" :class="record.statusClass">{{ record.status }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Withdraw Popup -->
    <van-popup v-model:show="showWithdrawPopup" position="bottom" round :style="{ maxHeight: '50vh' }">
      <div class="withdraw-popup">
        <div class="popup-header">
          <h3>{{ t('income.withdrawToBalance') }}</h3>
          <van-icon name="cross" @click="showWithdrawPopup = false" />
        </div>
        <div class="withdraw-form">
          <div class="withdraw-available">{{ t('income.availableAmount', { amount: '760.00' }) }}</div>
          <van-field
            v-model="withdrawAmount"
            type="number"
            :placeholder="t('income.withdrawAmount')"
            class="withdraw-input"
          >
            <template #button>
              <van-button size="small" type="primary" round @click="withdrawAmount = '760.00'">{{ t('income.withdrawAll') }}</van-button>
            </template>
          </van-field>
          <van-button round block type="primary" class="withdraw-submit-btn" @click="handleWithdraw">
            {{ t('income.withdrawSubmit') }}
          </van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { showToast } from 'vant'
const { t } = useI18n()

const activeTab = ref('all')
const activePeriod = ref('all')
const showWithdrawPopup = ref(false)
const withdrawAmount = ref('')

const periodTabs = computed(() => [
  { id: 'all', label: t('common.all') },
  { id: 'daily', label: t('common.daily') },
  { id: 'weekly', label: t('common.weekly') },
  { id: 'monthly', label: t('common.monthly') }
])

const incomeTabs = computed(() => [
  { id: 'all', label: t('income.all') },
  { id: 'commission', label: t('income.commissionTab') },
  { id: 'rebate', label: t('income.rebateTab') },
  { id: 'withdrawn', label: t('income.withdrawnTab') }
])

const allRecords = ref([
  { id: 1, type: '佣金收益', desc: '下级用户 138****5678 投注佣金', time: '2026-03-29 18:30', amount: 45.60, icon: '💰', iconBg: 'rgba(245,158,11,0.2)', status: '已到账', statusClass: 'success', category: 'commission' },
  { id: 2, type: '返佣收益', desc: '下级用户游戏返佣', time: '2026-03-29 15:20', amount: 23.80, icon: '🔄', iconBg: 'rgba(59,130,246,0.2)', status: '已到账', statusClass: 'success', category: 'rebate' },
  { id: 3, type: '佣金收益', desc: '下级用户 177****9012 充值佣金', time: '2026-03-29 12:10', amount: 88.00, icon: '💰', iconBg: 'rgba(245,158,11,0.2)', status: '待结算', statusClass: 'pending', category: 'commission' },
  { id: 4, type: '提现', desc: '提现至银行卡 ****6789', time: '2026-03-28 20:00', amount: -500.00, icon: '💳', iconBg: 'rgba(124,58,237,0.2)', status: '已完成', statusClass: 'success', category: 'withdrawn' },
  { id: 5, type: '返佣收益', desc: '下级用户投注返佣', time: '2026-03-28 16:45', amount: 12.50, icon: '🔄', iconBg: 'rgba(59,130,246,0.2)', status: '已到账', statusClass: 'success', category: 'rebate' },
  { id: 6, type: '佣金收益', desc: '下级用户 155****3456 投注佣金', time: '2026-03-28 10:30', amount: 36.20, icon: '💰', iconBg: 'rgba(245,158,11,0.2)', status: '已到账', statusClass: 'success', category: 'commission' },
  { id: 7, type: '提现', desc: '提现至USDT钱包', time: '2026-03-27 14:20', amount: -1320.00, icon: '💳', iconBg: 'rgba(124,58,237,0.2)', status: '已完成', statusClass: 'success', category: 'withdrawn' },
  { id: 8, type: '返佣收益', desc: '下级用户充值返佣', time: '2026-03-27 09:15', amount: 56.00, icon: '🔄', iconBg: 'rgba(59,130,246,0.2)', status: '已到账', statusClass: 'success', category: 'rebate' }
])

const filteredRecords = computed(() => {
  if (activeTab.value === 'all') return allRecords.value
  return allRecords.value.filter(r => r.category === activeTab.value)
})

function handleWithdraw() {
  const amount = parseFloat(withdrawAmount.value)
  if (!amount || amount < 10) {
    showToast({ message: t('income.withdrawMinError'), position: 'bottom' })
    return
  }
  if (amount > 760) {
    showToast({ message: t('income.withdrawMaxError'), position: 'bottom' })
    return
  }
  showToast({ message: t('income.withdrawSuccess'), type: 'success' })
  showWithdrawPopup.value = false
  withdrawAmount.value = ''
}
</script>

<style lang="scss" scoped>
.page-content {
  padding: 16px;
}

.income-cards {
  margin-bottom: 20px;
}

.income-card {
  background: $bg-card;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;

  &.primary {
    background: linear-gradient(135deg, $accent-purple, #4c1d95);
    margin-bottom: 10px;
    padding: 20px;
  }
}

.card-top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-sub-row {
  display: flex;
  align-items: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
}

.sub-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sub-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
}

.sub-value {
  font-size: 16px;
  font-weight: 600;
}

.sub-divider {
  width: 1px;
  height: 30px;
  background: rgba(255, 255, 255, 0.15);
  margin: 0 16px;
}

.income-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;

  &.three-col {
    grid-template-columns: 1fr 1fr 1fr;
  }
}

.status-card {
  align-items: center;
  text-align: center;

  &.pending {
    border: 1px solid rgba(245, 158, 11, 0.3);
  }
}

.card-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.card-amount {
  font-size: 28px;
  font-weight: 700;

  &.small { font-size: 18px; }
}

.card-unit {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.card-trend {
  font-size: 11px;
  font-weight: 600;

  &.up { color: $accent-green; }
  &.neutral { color: $text-muted; }
}

.card-hint {
  font-size: 10px;
  color: $accent-gold;
}

.income-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 16px;
  background: $bg-card;
  border-radius: 10px;
  padding: 3px;
}

.income-tab {
  flex: 1;
  text-align: center;
  padding: 8px 0;
  font-size: 13px;
  color: $text-secondary;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &.active {
    background: $accent-purple;
    color: #fff;
    font-weight: 600;
  }
}

.history-section {
  h3 {
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 12px;
  }
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px;
  background: $bg-card;
  border-radius: 10px;
  margin-bottom: 8px;
}

.item-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.item-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item-type {
  font-size: 14px;
  font-weight: 500;
}

.item-desc {
  font-size: 11px;
  color: $text-muted;
}

.item-time {
  font-size: 11px;
  color: $text-muted;
}

.item-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.item-amount {
  font-size: 15px;
  font-weight: 600;
  color: $accent-gold;

  &.negative {
    color: $text-secondary;
  }
}

.item-status {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 4px;

  &.success {
    color: $accent-green;
    background: rgba(16, 185, 129, 0.1);
  }

  &.pending {
    color: $accent-gold;
    background: rgba(245, 158, 11, 0.1);
  }
}

/* Period Tabs */
.period-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.period-tab {
  flex: 1;
  text-align: center;
  padding: 6px 0;
  font-size: 12px;
  color: $text-secondary;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &.active {
    border-color: $accent-purple;
    color: $accent-purple-light;
    background: rgba(124, 58, 237, 0.1);
  }
}

/* Withdraw Section */
.withdraw-section {
  margin-bottom: 16px;
}

.withdraw-btn {
  background: linear-gradient(135deg, $accent-gold, #d97706) !important;
  border: none !important;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Withdraw Popup */
.withdraw-popup {
  padding: 20px 16px;
}

.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;

  h3 {
    font-size: 16px;
    font-weight: 600;
  }

  .van-icon {
    font-size: 20px;
    color: $text-muted;
    cursor: pointer;
  }
}

.withdraw-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.withdraw-available {
  font-size: 13px;
  color: $accent-gold;
  text-align: center;
}

.withdraw-input {
  :deep(.van-field__body) {
    background: $bg-card;
    border-radius: 8px;
  }
}

.withdraw-submit-btn {
  background: linear-gradient(135deg, $accent-purple, #4c1d95) !important;
  border: none !important;
  font-weight: 600;
  margin-top: 4px;
}
</style>
