<template>
  <div class="withdraw-page">
    <van-nav-bar
      title="提现"
      left-arrow
      @click-left="$router.back()"
      fixed
      :style="{ maxWidth: '480px', margin: '0 auto' }"
    />
    <div class="page-content" style="padding-top: 46px;">
      <!-- Balance Card -->
      <div class="balance-card">
        <div class="balance-row">
          <div class="balance-info">
            <span class="balance-label">可提现余额</span>
            <span class="balance-amount">{{ walletStore.balance.toFixed(2) }}</span>
          </div>
          <span class="balance-unit">USDT</span>
        </div>
        <div class="balance-tips">
          <span>今日已提现: 0.00</span>
          <span>今日剩余: 50,000.00</span>
        </div>
      </div>

      <!-- Withdraw Method -->
      <div class="section">
        <h3 class="section-title">提现方式</h3>
        <div class="method-grid">
          <div
            v-for="m in methods"
            :key="m.id"
            class="method-item"
            :class="{ active: activeMethod === m.id }"
            @click="activeMethod = m.id"
          >
            <span class="method-icon">{{ m.icon }}</span>
            <span class="method-name">{{ m.name }}</span>
            <span class="method-desc">{{ m.desc }}</span>
          </div>
        </div>
      </div>

      <!-- USDT Address (when USDT selected) -->
      <div class="section" v-if="activeMethod === 'usdt'">
        <h3 class="section-title">收款地址 (TRC20)</h3>
        <van-field
          v-model="usdtAddress"
          placeholder="请输入USDT-TRC20钱包地址"
          class="form-input"
        />
        <p class="field-tip">请确认地址为TRC20网络，错误的地址将导致资产丢失</p>
      </div>

      <!-- Bank Card Info (when bank selected) -->
      <div class="section" v-if="activeMethod === 'bank'">
        <h3 class="section-title">银行卡信息</h3>
        <van-field
          v-model="bankName"
          placeholder="开户银行"
          class="form-input"
        />
        <van-field
          v-model="cardNumber"
          placeholder="银行卡号"
          type="digit"
          class="form-input"
        />
        <van-field
          v-model="realName"
          placeholder="开户姓名"
          class="form-input"
        />
      </div>

      <!-- Amount -->
      <div class="section">
        <h3 class="section-title">提现金额</h3>
        <van-field
          v-model="amount"
          type="number"
          placeholder="请输入提现金额"
          class="form-input amount-field"
        >
          <template #button>
            <span class="amount-all" @click="amount = String(walletStore.balance)">全部</span>
          </template>
        </van-field>
        <div class="quick-amounts">
          <span
            v-for="qa in quickAmounts"
            :key="qa"
            class="quick-amount-btn"
            :class="{ active: amount === String(qa) }"
            @click="amount = String(qa)"
          >
            {{ qa }}
          </span>
        </div>
        <p class="field-tip">单笔最低 50 USDT，单笔最高 50,000 USDT</p>
      </div>

      <!-- Fee info -->
      <div class="fee-info">
        <div class="fee-row">
          <span>手续费</span>
          <span class="fee-value">{{ fee.toFixed(2) }} USDT</span>
        </div>
        <div class="fee-row">
          <span>实际到账</span>
          <span class="fee-value highlight">{{ actualAmount.toFixed(2) }} USDT</span>
        </div>
        <div class="fee-row">
          <span>预计到账时间</span>
          <span class="fee-value">5-30 分钟</span>
        </div>
      </div>

      <!-- Withdraw Password -->
      <div class="section">
        <van-field
          v-model="withdrawPassword"
          type="password"
          placeholder="请输入提现密码"
          class="form-input"
        />
      </div>

      <van-button type="primary" round block size="large" :loading="loading" @click="onSubmit" class="submit-btn">
        确认提现
      </van-button>

      <!-- Withdraw Records -->
      <div class="records-section">
        <h3 class="section-title">提现记录</h3>
        <div v-if="records.length === 0" class="empty-records">暂无提现记录</div>
        <div v-for="record in records" :key="record.id" class="record-card">
          <div class="record-left">
            <span class="record-method">{{ record.method }}</span>
            <span class="record-time">{{ record.time }}</span>
            <span class="record-address">{{ record.address }}</span>
          </div>
          <div class="record-right">
            <span class="record-amount">-{{ record.amount.toFixed(2) }}</span>
            <span class="record-status" :class="record.status">
              {{ record.status === 'completed' ? '已完成' : record.status === 'pending' ? '处理中' : '失败' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useWalletStore } from '@/stores/wallet'
import { mockWithdrawRecords } from '@/mock'
import { showToast } from 'vant'

const walletStore = useWalletStore()
const amount = ref('')
const activeMethod = ref('usdt')
const loading = ref(false)
const usdtAddress = ref('')
const bankName = ref('')
const cardNumber = ref('')
const realName = ref('')
const withdrawPassword = ref('')
const records = ref(JSON.parse(JSON.stringify(mockWithdrawRecords)))

const quickAmounts = [100, 500, 1000, 5000, 10000]

const methods = [
  { id: 'usdt', name: 'USDT-TRC20', icon: '💎', desc: '免手续费' },
  { id: 'bank', name: '银行卡', icon: '🏦', desc: '1%手续费' }
]

const fee = computed(() => {
  const amt = Number(amount.value) || 0
  if (activeMethod.value === 'bank') {
    return amt * 0.01
  }
  return 0
})

const actualAmount = computed(() => {
  const amt = Number(amount.value) || 0
  return Math.max(0, amt - fee.value)
})

async function onSubmit() {
  const amt = Number(amount.value)
  if (!amt || amt < 50) {
    showToast({ message: '最低提现金额为50 USDT', type: 'fail' })
    return
  }
  if (amt > 50000) {
    showToast({ message: '单笔最高提现50,000 USDT', type: 'fail' })
    return
  }
  if (amt > walletStore.balance) {
    showToast({ message: '余额不足', type: 'fail' })
    return
  }
  if (activeMethod.value === 'usdt' && !usdtAddress.value) {
    showToast({ message: '请输入USDT收款地址', type: 'fail' })
    return
  }
  if (activeMethod.value === 'bank' && (!bankName.value || !cardNumber.value || !realName.value)) {
    showToast({ message: '请填写完整银行卡信息', type: 'fail' })
    return
  }
  if (!withdrawPassword.value) {
    showToast({ message: '请输入提现密码', type: 'fail' })
    return
  }

  loading.value = true
  try {
    await walletStore.withdraw(amt)
    const newRecord = {
      id: Date.now(),
      amount: amt,
      method: activeMethod.value === 'usdt' ? 'USDT-TRC20' : '银行卡',
      status: 'pending',
      time: new Date().toLocaleString('zh-CN'),
      address: activeMethod.value === 'usdt'
        ? usdtAddress.value.slice(0, 4) + '...' + usdtAddress.value.slice(-4)
        : bankName.value + ' ****' + cardNumber.value.slice(-4)
    }
    records.value.unshift(newRecord)
    showToast({ message: '提现申请已提交', type: 'success' })
    amount.value = ''
    withdrawPassword.value = ''
  } catch (e) {
    showToast({ message: e.message || '提现失败', type: 'fail' })
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
  margin-bottom: 20px;
}

.balance-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 12px;
}

.balance-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.balance-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}

.balance-amount {
  font-size: 32px;
  font-weight: 700;
}

.balance-unit {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
}

.balance-tips {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  padding-top: 10px;
}

.section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 10px;
}

.method-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.method-item {
  padding: 14px 12px;
  border-radius: 12px;
  background: $bg-card;
  text-align: center;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  border: 2px solid transparent;
  transition: all 0.2s;

  &.active {
    border-color: $accent-purple;
    background: rgba(124, 58, 237, 0.1);
  }
}

.method-icon {
  font-size: 28px;
}

.method-name {
  font-size: 13px;
  font-weight: 600;
}

.method-desc {
  font-size: 10px;
  color: $text-muted;
}

.form-input {
  background: $bg-card;
  border-radius: 10px;
  margin-bottom: 8px;
}

.field-tip {
  font-size: 11px;
  color: $text-muted;
  margin-top: 4px;
}

.amount-all {
  color: $accent-purple;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.quick-amounts {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.quick-amount-btn {
  padding: 6px 16px;
  border-radius: 20px;
  background: $bg-card;
  font-size: 13px;
  color: $text-secondary;
  cursor: pointer;
  transition: all 0.2s;

  &.active {
    background: $accent-purple;
    color: #fff;
  }
}

.fee-info {
  background: $bg-card;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 20px;
}

.fee-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 13px;
  color: $text-secondary;
}

.fee-value {
  font-weight: 600;
  color: $text-primary;

  &.highlight {
    color: $accent-gold;
  }
}

.submit-btn {
  margin-bottom: 24px;
}

.records-section {
  padding-top: 4px;
}

.empty-records {
  text-align: center;
  padding: 30px;
  color: $text-muted;
  font-size: 13px;
}

.record-card {
  background: $bg-card;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.record-left {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.record-method {
  font-size: 14px;
  font-weight: 600;
}

.record-time {
  font-size: 11px;
  color: $text-muted;
}

.record-address {
  font-size: 11px;
  color: $text-muted;
}

.record-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.record-amount {
  font-size: 16px;
  font-weight: 700;
  color: #ef4444;
}

.record-status {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;

  &.completed {
    color: #10b981;
    background: rgba(16, 185, 129, 0.1);
  }
  &.pending {
    color: $accent-gold;
    background: rgba(245, 158, 11, 0.1);
  }
  &.failed {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
  }
}
</style>
