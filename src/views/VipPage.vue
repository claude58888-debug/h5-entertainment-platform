<template>
  <div class="vip-page">
    <van-nav-bar title="VIP Center" left-arrow @click-left="$router.back()" fixed :style="{ maxWidth: '480px', margin: '0 auto' }" />
    <div class="page-content" style="padding-top: 46px;">
      <div class="vip-header">
        <div class="current-vip">
          <span class="vip-icon">👑</span>
          <span class="vip-level">VIP {{ currentLevel }}</span>
        </div>
        <div class="vip-progress">
          <van-progress :percentage="progressPct" stroke-width="8" color="#f59e0b" track-color="#1e2a4a" />
          <span class="progress-text">{{ currentDeposit }}/{{ nextRequirement }} USDT to VIP {{ currentLevel + 1 }}</span>
        </div>
      </div>

      <div class="vip-benefits">
        <h3>VIP Benefits</h3>
        <div class="benefit-grid">
          <div class="benefit-item" v-for="b in benefits" :key="b.label">
            <span class="benefit-icon">{{ b.icon }}</span>
            <span class="benefit-label">{{ b.label }}</span>
          </div>
        </div>
      </div>

      <div class="vip-table-section">
        <h3>VIP Levels</h3>
        <div class="vip-table">
          <div class="table-header">
            <span>Level</span><span>Deposit</span><span>Turnover</span><span>Upgrade Bonus</span><span>Monthly</span>
          </div>
          <div class="table-row" v-for="level in levels" :key="level.level" :class="{ current: level.level === currentLevel }">
            <span class="level-badge">VIP{{ level.level }}</span>
            <span>{{ level.deposit }}</span>
            <span>{{ level.turnover }}</span>
            <span class="gold">{{ level.upgradeBonus }}</span>
            <span class="gold">{{ level.monthlyPacket }}</span>
          </div>
        </div>
      </div>

      <div class="vip-rules">
        <h3>Rules</h3>
        <div class="rules-content">
          <p>1. VIP level is calculated daily at 8:00 AM (UTC+8)</p>
          <p>2. Deposit and turnover accumulated since registration</p>
          <p>3. Upgrade bonus is credited automatically upon level-up</p>
          <p>4. Monthly red packets can be claimed on the 1st of each month</p>
          <p>5. VIP benefits are cumulative and permanent</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const currentLevel = 3
const currentDeposit = 8500
const nextRequirement = 20000
const progressPct = Math.min((currentDeposit / nextRequirement) * 100, 100)

const benefits = [
  { icon: '💰', label: 'Upgrade Bonus' }, { icon: '🧧', label: 'Monthly Red Packet' },
  { icon: '💸', label: 'Loss Rebate' }, { icon: '⚡', label: 'Fast Withdrawal' },
  { icon: '🎁', label: 'Birthday Gift' }, { icon: '👤', label: 'Personal Manager' }
]

const levels = [
  { level: 0, deposit: '0', turnover: '0', upgradeBonus: '-', monthlyPacket: '-' },
  { level: 1, deposit: '500', turnover: '5,000', upgradeBonus: '18U', monthlyPacket: '8U' },
  { level: 2, deposit: '2,000', turnover: '20,000', upgradeBonus: '58U', monthlyPacket: '18U' },
  { level: 3, deposit: '5,000', turnover: '80,000', upgradeBonus: '128U', monthlyPacket: '38U' },
  { level: 4, deposit: '20,000', turnover: '300,000', upgradeBonus: '388U', monthlyPacket: '88U' },
  { level: 5, deposit: '50,000', turnover: '1,000,000', upgradeBonus: '888U', monthlyPacket: '188U' }
]
</script>

<style lang="scss" scoped>
.page-content { padding: 16px; }
.vip-header { background: linear-gradient(135deg, #f59e0b, #b45309); border-radius: 16px; padding: 24px; margin-bottom: 20px; }
.current-vip { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
.vip-icon { font-size: 32px; }
.vip-level { font-size: 24px; font-weight: 700; }
.progress-text { font-size: 11px; color: rgba(255,255,255,0.7); margin-top: 6px; display: block; }
.vip-benefits { margin-bottom: 20px; h3 { font-size: 16px; font-weight: 700; margin-bottom: 12px; } }
.benefit-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.benefit-item { background: $bg-card; border-radius: 10px; padding: 14px 8px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 6px; }
.benefit-icon { font-size: 24px; }
.benefit-label { font-size: 11px; color: $text-secondary; }
.vip-table-section { margin-bottom: 20px; h3 { font-size: 16px; font-weight: 700; margin-bottom: 12px; } }
.vip-table { background: $bg-card; border-radius: 12px; overflow: hidden; }
.table-header { display: grid; grid-template-columns: 1fr 1.2fr 1.2fr 1.2fr 1fr; padding: 10px 8px; font-size: 10px; color: $text-muted; border-bottom: 1px solid $border-color; }
.table-row { display: grid; grid-template-columns: 1fr 1.2fr 1.2fr 1.2fr 1fr; padding: 10px 8px; font-size: 11px; border-bottom: 1px solid $border-color;
  &.current { background: rgba($accent-gold, 0.1); }
  &:last-child { border-bottom: none; }
}
.level-badge { font-weight: 700; color: $accent-gold; }
.gold { color: $accent-gold; font-weight: 600; }
.vip-rules { h3 { font-size: 16px; font-weight: 700; margin-bottom: 12px; } }
.rules-content { background: $bg-card; border-radius: 12px; padding: 16px; p { font-size: 13px; color: $text-secondary; line-height: 2; } }
</style>
