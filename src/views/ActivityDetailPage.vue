<template>
  <div class="activity-detail-page">
    <van-nav-bar title="Activity Detail" left-arrow @click-left="$router.back()" fixed :style="{ maxWidth: '480px', margin: '0 auto' }" />
    <div class="page-content" style="padding-top: 46px;">
      <div class="activity-banner">
        <img src="https://picsum.photos/750/360?random=90" alt="activity" />
      </div>
      <div class="activity-info">
        <h2>Daily First Deposit Bonus</h2>
        <p class="activity-desc">Make your first deposit each day and receive bonus rewards instantly!</p>
      </div>

      <div class="reward-table">
        <h3>Reward Table</h3>
        <div class="table-wrap">
          <div class="t-header"><span>Deposit</span><span>Bonus</span><span>Turnover</span></div>
          <div class="t-row" v-for="r in rewards" :key="r.deposit">
            <span>≥{{ r.deposit }}U</span><span class="gold">+{{ r.bonus }}U</span><span>{{ r.turnover }}x</span>
          </div>
        </div>
      </div>

      <div class="rules-section">
        <h3>Rules</h3>
        <div class="rules-box">
          <p>1. Only the first deposit of each day qualifies</p>
          <p>2. Bonus is credited within 5 minutes after deposit</p>
          <p>3. Turnover requirement must be met before withdrawal</p>
          <p>4. Maximum bonus per day is 588 USDT</p>
          <p>5. This promotion cannot be combined with other offers</p>
          <p>6. Management reserves the right to modify or cancel this promotion</p>
        </div>
      </div>

      <van-button type="primary" round block size="large" @click="$router.push('/recharge')">
        Deposit Now
      </van-button>
    </div>
  </div>
</template>

<script setup>
const rewards = [
  { deposit: 100, bonus: 8, turnover: 3 }, { deposit: 500, bonus: 28, turnover: 3 },
  { deposit: 1000, bonus: 68, turnover: 3 }, { deposit: 2000, bonus: 118, turnover: 3 },
  { deposit: 5000, bonus: 258, turnover: 3 }, { deposit: 10000, bonus: 588, turnover: 3 }
]
</script>

<style lang="scss" scoped>
.page-content { padding: 0 0 24px; }
.activity-banner { width: 100%; height: 200px; img { width: 100%; height: 100%; object-fit: cover; } }
.activity-info { padding: 16px; h2 { font-size: 20px; margin-bottom: 8px; } }
.activity-desc { font-size: 14px; color: $text-secondary; line-height: 1.5; }
.reward-table { padding: 0 16px 16px; h3 { font-size: 16px; font-weight: 700; margin-bottom: 10px; } }
.table-wrap { background: $bg-card; border-radius: 12px; overflow: hidden; }
.t-header { display: grid; grid-template-columns: 1fr 1fr 1fr; padding: 10px 16px; font-size: 12px; color: $text-muted; border-bottom: 1px solid $border-color; }
.t-row { display: grid; grid-template-columns: 1fr 1fr 1fr; padding: 10px 16px; font-size: 13px; border-bottom: 1px solid $border-color; &:last-child { border-bottom: none; } }
.gold { color: $accent-gold; font-weight: 600; }
.rules-section { padding: 0 16px 20px; h3 { font-size: 16px; font-weight: 700; margin-bottom: 10px; } }
.rules-box { background: $bg-card; border-radius: 12px; padding: 16px; p { font-size: 13px; color: $text-secondary; line-height: 2; } }
van-button { margin: 0 16px; width: calc(100% - 32px); }
</style>
