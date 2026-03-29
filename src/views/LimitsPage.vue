<template>
  <div class="limits-page">
    <van-nav-bar title="存款/投注限额" left-arrow @click-left="$router.back()" />

    <div class="page-content">
      <div class="info-banner">
        <span class="info-icon">🛡️</span>
        <p>设置限额以帮助您控制游戏花费。限额可随时降低，但提高限额需要24小时后生效。</p>
      </div>

      <van-tabs v-model:active="activeTab">
        <van-tab title="充值限额">
          <div class="limit-section">
            <div class="limit-item" v-for="period in periods" :key="'deposit-' + period.value">
              <div class="limit-header">
                <span class="limit-label">{{ period.label }}充值限额</span>
                <span class="limit-current" v-if="getLimit('deposit', period.value)">
                  当前: ¥{{ getLimit('deposit', period.value).toLocaleString() }}
                </span>
                <span class="limit-current" v-else>未设置</span>
              </div>
              <div class="limit-input">
                <van-field
                  v-model="depositLimits[period.value]"
                  type="number"
                  :placeholder="`输入${period.label}限额`"
                  input-align="right"
                >
                  <template #label>¥</template>
                  <template #button>
                    <van-button size="small" type="primary" @click="saveLimit('deposit', period.value)" :loading="saving">保存</van-button>
                  </template>
                </van-field>
              </div>
            </div>
          </div>
        </van-tab>

        <van-tab title="投注限额">
          <div class="limit-section">
            <div class="limit-item" v-for="period in periods" :key="'bet-' + period.value">
              <div class="limit-header">
                <span class="limit-label">{{ period.label }}投注限额</span>
                <span class="limit-current" v-if="getLimit('bet', period.value)">
                  当前: ¥{{ getLimit('bet', period.value).toLocaleString() }}
                </span>
                <span class="limit-current" v-else>未设置</span>
              </div>
              <div class="limit-input">
                <van-field
                  v-model="betLimits[period.value]"
                  type="number"
                  :placeholder="`输入${period.label}限额`"
                  input-align="right"
                >
                  <template #label>¥</template>
                  <template #button>
                    <van-button size="small" type="primary" @click="saveLimit('bet', period.value)" :loading="saving">保存</van-button>
                  </template>
                </van-field>
              </div>
            </div>
          </div>
        </van-tab>
      </van-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { showToast } from 'vant'
import request from '@/utils/request'

const activeTab = ref(0)
const saving = ref(false)
const currentLimits = ref([])
const depositLimits = reactive({ daily: '', weekly: '', monthly: '' })
const betLimits = reactive({ daily: '', weekly: '', monthly: '' })

const periods = [
  { value: 'daily', label: '每日' },
  { value: 'weekly', label: '每周' },
  { value: 'monthly', label: '每月' }
]

function getLimit(type, period) {
  const limit = currentLimits.value.find(l => l.limitType === type && l.period === period)
  return limit ? limit.amount : 0
}

onMounted(async () => {
  try {
    const data = await request.get('/compliance/limits')
    if (data) {
      currentLimits.value = data
      data.forEach(l => {
        if (l.limitType === 'deposit') depositLimits[l.period] = String(l.amount)
        if (l.limitType === 'bet') betLimits[l.period] = String(l.amount)
      })
    }
  } catch (e) {
    // Ignore
  }
})

async function saveLimit(limitType, period) {
  const amount = Number(limitType === 'deposit' ? depositLimits[period] : betLimits[period])
  if (isNaN(amount) || amount < 0) {
    showToast({ message: '请输入有效金额', position: 'bottom' })
    return
  }

  saving.value = true
  try {
    await request.put('/compliance/limits', { limitType, period, amount })
    showToast({ message: '限额已更新', position: 'bottom' })
    // Refresh limits
    const data = await request.get('/compliance/limits')
    if (data) currentLimits.value = data
  } catch (e) {
    showToast({ message: e?.response?.data?.error || '保存失败', position: 'bottom' })
  } finally {
    saving.value = false
  }
}
</script>

<style lang="scss" scoped>
.limits-page {
  min-height: 100vh;
  background: $bg-primary;
}

.page-content {
  padding: 16px;
}

.info-banner {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: rgba(230, 162, 60, 0.15);
  border: 1px solid rgba(230, 162, 60, 0.3);
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 16px;

  .info-icon { font-size: 24px; flex-shrink: 0; }
  p { font-size: 13px; color: $text-secondary; line-height: 1.5; }
}

.limit-section {
  padding: 12px 0;
}

.limit-item {
  background: $bg-card;
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 10px;
}

.limit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;

  .limit-label { font-size: 14px; font-weight: 600; }
  .limit-current { font-size: 12px; color: $text-muted; }
}
</style>
