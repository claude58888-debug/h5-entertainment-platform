<template>
  <div class="prize-record-page">
    <van-nav-bar title="Prize Records" left-arrow @click-left="$router.back()" fixed :style="{ maxWidth: '480px', margin: '0 auto' }" />
    <div class="page-content" style="padding-top: 46px;">
      <van-tabs v-model:active="activeTab" sticky shrink>
        <van-tab title="Lottery Wheel">
          <div class="wheel-section">
            <div class="wheel-placeholder">
              <div class="wheel-inner">🎡</div>
              <p>Daily Free Spin</p>
              <van-button type="primary" round size="small" @click="spinWheel" :loading="spinning">{{ spinning ? 'Spinning...' : 'Spin Now' }}</van-button>
            </div>
            <div v-if="wheelResult" class="wheel-result">
              <span class="result-text">🎉 You won: {{ wheelResult }}</span>
            </div>
          </div>
          <div class="record-list">
            <h3>History</h3>
            <div v-for="r in wheelRecords" :key="r.id" class="record-item">
              <div class="r-left"><span class="r-prize">{{ r.prize }}</span><span class="r-time">{{ r.time }}</span></div>
              <span class="r-status claimed">Claimed</span>
            </div>
          </div>
        </van-tab>
        <van-tab title="Coupons">
          <div class="coupon-list">
            <div v-for="c in coupons" :key="c.id" class="coupon-item">
              <div class="coupon-left">
                <span class="coupon-amount">{{ c.amount }}<small>U</small></span>
                <span class="coupon-min">Min {{ c.minDeposit }}U</span>
              </div>
              <div class="coupon-right">
                <span class="coupon-name">{{ c.name }}</span>
                <span class="coupon-expire">Expires: {{ c.expire }}</span>
                <van-button v-if="!c.used" type="primary" round size="mini" @click="c.used=true">Use</van-button>
                <span v-else class="coupon-used">Used</span>
              </div>
            </div>
          </div>
        </van-tab>
      </van-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { showToast } from 'vant'
const activeTab = ref(0)
const spinning = ref(false)
const wheelResult = ref('')

const prizes = ['5 USDT', '10 USDT', '0.5 USDT', '1 USDT', 'Try Again', '20 USDT', '2 USDT', '50 USDT']
function spinWheel() {
  spinning.value = true; wheelResult.value = ''
  setTimeout(() => {
    spinning.value = false; const p = prizes[Math.floor(Math.random()*prizes.length)]
    wheelResult.value = p; showToast({ message: `Won ${p}!`, type: 'success' })
  }, 2000)
}

const wheelRecords = [
  { id: 1, prize: '10 USDT Bonus', time: '2024-03-15 12:00' },
  { id: 2, prize: '5 USDT Bonus', time: '2024-03-14 12:00' },
  { id: 3, prize: '1 USDT Bonus', time: '2024-03-13 12:00' },
  { id: 4, prize: '20 USDT Bonus', time: '2024-03-12 12:00' }
]
const coupons = reactive([
  { id: 1, amount: 10, minDeposit: 100, name: 'Deposit Coupon', expire: '2024-04-15', used: false },
  { id: 2, amount: 50, minDeposit: 500, name: 'VIP Coupon', expire: '2024-04-20', used: false },
  { id: 3, amount: 5, minDeposit: 50, name: 'New User Coupon', expire: '2024-03-30', used: true },
  { id: 4, amount: 100, minDeposit: 1000, name: 'Special Coupon', expire: '2024-05-01', used: false }
])
</script>

<style lang="scss" scoped>
.page-content { padding: 0; }
:deep(.van-tabs__nav) { background: transparent; }
:deep(.van-tab) { color: $text-secondary; font-size: 14px; }
:deep(.van-tab--active) { color: #fff; }
:deep(.van-tabs__line) { background: $accent-purple; }
.wheel-section { text-align: center; padding: 24px 16px; }
.wheel-placeholder { display: flex; flex-direction: column; align-items: center; gap: 12px; }
.wheel-inner { font-size: 80px; }
.wheel-result { margin-top: 16px; padding: 12px; background: linear-gradient(135deg, $accent-gold, #b45309); border-radius: 10px; }
.result-text { font-size: 16px; font-weight: 600; }
.record-list { padding: 0 16px 16px; h3 { font-size: 15px; font-weight: 700; margin-bottom: 10px; } }
.record-item { display: flex; justify-content: space-between; align-items: center; padding: 12px; background: $bg-card; border-radius: 10px; margin-bottom: 8px; }
.r-left { display: flex; flex-direction: column; gap: 4px; }
.r-prize { font-size: 14px; font-weight: 500; }
.r-time { font-size: 11px; color: $text-muted; }
.r-status { font-size: 11px; padding: 2px 8px; border-radius: 8px; &.claimed { background: rgba(16,185,129,0.15); color: #10b981; } }
.coupon-list { padding: 16px; }
.coupon-item { display: flex; background: $bg-card; border-radius: 12px; margin-bottom: 10px; overflow: hidden; }
.coupon-left { width: 90px; background: linear-gradient(135deg, $accent-purple, #4c1d95); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 12px 8px; }
.coupon-amount { font-size: 24px; font-weight: 700; color: $accent-gold; small { font-size: 12px; } }
.coupon-min { font-size: 10px; color: rgba(255,255,255,0.6); }
.coupon-right { flex: 1; padding: 12px; display: flex; flex-direction: column; gap: 4px; }
.coupon-name { font-size: 14px; font-weight: 600; }
.coupon-expire { font-size: 11px; color: $text-muted; }
.coupon-used { font-size: 11px; color: $text-muted; }
</style>
