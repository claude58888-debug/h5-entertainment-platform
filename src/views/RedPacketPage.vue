<template>
  <div class="redpacket-page">
    <van-nav-bar title="Send Red Packet" left-arrow @click-left="$router.back()" fixed :style="{ maxWidth: '480px', margin: '0 auto' }" />
    <div class="page-content" style="padding-top: 46px;">
      <div class="rp-header">
        <span class="rp-icon">🧧</span>
        <h2>Send Red Packet</h2>
      </div>

      <van-form @submit="onSubmit" class="rp-form">
        <van-cell-group inset>
          <van-field v-model="totalAmount" type="number" label="Total Amount" placeholder="Enter total amount (USDT)" :rules="[{required:true}]" />
          <van-field v-model="count" type="digit" label="Count" placeholder="Number of red packets" :rules="[{required:true}]" />
          <van-field name="type" label="Type">
            <template #input>
              <van-radio-group v-model="rpType" direction="horizontal">
                <van-radio name="random">Random</van-radio>
                <van-radio name="fixed">Fixed</van-radio>
              </van-radio-group>
            </template>
          </van-field>
          <van-field v-model="turnoverMulti" type="number" label="Turnover" placeholder="Turnover multiplier (e.g. 3)" :rules="[{required:true}]" />
        </van-cell-group>

        <div class="rp-summary">
          <div class="summary-row"><span>Total Amount</span><span class="gold">{{ totalAmount || 0 }} USDT</span></div>
          <div class="summary-row"><span>Packets</span><span>{{ count || 0 }}</span></div>
          <div class="summary-row"><span>Turnover Req.</span><span>{{ turnoverMulti || 0 }}x</span></div>
        </div>

        <van-button type="primary" round block size="large" native-type="submit" :loading="loading">
          Send Red Packet 🧧
        </van-button>
      </van-form>

      <div class="rp-history">
        <h3>My Red Packets</h3>
        <div v-for="i in 3" :key="i" class="rp-item">
          <div class="rp-item-left">
            <span class="rp-mini-icon">🧧</span>
            <div><span class="rp-item-amount">{{ (Math.random()*100+10).toFixed(2) }} USDT</span><span class="rp-item-info">{{ 3+i }}/10 claimed</span></div>
          </div>
          <span class="rp-item-status">Active</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { showToast } from 'vant'
const totalAmount = ref('')
const count = ref('')
const rpType = ref('random')
const turnoverMulti = ref('3')
const loading = ref(false)

function onSubmit() {
  loading.value = true
  setTimeout(() => { loading.value = false; showToast({ message: 'Red packet sent!', type: 'success' }) }, 1000)
}
</script>

<style lang="scss" scoped>
.page-content { padding: 16px; }
.rp-header { text-align: center; padding: 20px 0; .rp-icon { font-size: 56px; } h2 { margin-top: 8px; font-size: 20px; } }
.rp-form {
  :deep(.van-cell-group--inset) { margin: 0; background: transparent; }
  :deep(.van-cell) { background: $bg-card; margin-bottom: 8px; border-radius: 8px; }
}
.rp-summary { background: $bg-card; border-radius: 12px; padding: 16px; margin: 16px 0; }
.summary-row { display: flex; justify-content: space-between; font-size: 14px; padding: 4px 0; }
.gold { color: $accent-gold; font-weight: 600; }
.rp-history { margin-top: 24px; h3 { font-size: 16px; font-weight: 700; margin-bottom: 12px; } }
.rp-item { display: flex; justify-content: space-between; align-items: center; background: $bg-card; border-radius: 10px; padding: 12px; margin-bottom: 8px; }
.rp-item-left { display: flex; align-items: center; gap: 10px; }
.rp-mini-icon { font-size: 28px; }
.rp-item-amount { font-size: 14px; font-weight: 600; display: block; }
.rp-item-info { font-size: 11px; color: $text-muted; }
.rp-item-status { font-size: 12px; color: #10b981; }
</style>
