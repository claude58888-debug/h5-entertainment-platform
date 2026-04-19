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
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import request from '@/utils/request'

const userStore = useUserStore()

const vipInfo = ref(null)
const currentLevel = computed(() => vipInfo.value?.currentLevel ?? userStore.user?.vipLevel ?? 0)
const currentDeposit = computed(() => vipInfo.value?.totalDeposit ?? 0)
const nextRequirement = computed(() => vipInfo.value?.nextLevelDeposit ?? 20000)
const progressPct = computed(() => Math.min((currentDeposit.value / (nextRequirement.value || 1)) * 100, 100))

const benefits = [
  { icon: '💰', label: 'Upgrade Bonus' }, { icon: '🧧', label: 'Monthly Red Packet' },
  { icon: '💸', label: 'Loss Rebate' }, { icon: '⚡', label: 'Fast Withdrawal' },
  { icon: '🎁', label: 'Birthday Gift' }, { icon: '👤', label: 'Personal Manager' }
]

const defaultLevels = [
  { level: 0, deposit: '0', turnover: '0', upgradeBonus: '-', monthlyPacket: '-' },
  { level: 1, deposit: '500', turnover: '5,000', upgradeBonus: '18U', monthlyPacket: '8U' },
  { level: 2, deposit: '2,000', turnover: '20,000', upgradeBonus: '58U', monthlyPacket: '18U' },
  { level: 3, deposit: '5,000', turnover: '80,000', upgradeBonus: '128U', monthlyPacket: '38U' },
  { level: 4, deposit: '20,000', turnover: '300,000', upgradeBonus: '388U', monthlyPacket: '88U' },
  { level: 5, deposit: '50,000', turnover: '1,000,000', upgradeBonus: '888U', monthlyPacket: '188U' }
]

const levels = ref(defaultLevels)

onMounted(async () => {
  try {
    const res = await request.get('/vip/info')
    if (res) {
      vipInfo.value = res
      if (res.levels && res.levels.length) {
        levels.value = res.levels.map(l => ({
          level: l.level,
          deposit: l.deposit?.toLocaleString() || '0',
          turnover: l.turnover?.toLocaleString() || '0',
          upgradeBonus: l.monthlyBonus ? `${l.monthlyBonus}U` : '-',
          monthlyPacket: l.birthdayBonus ? `${l.birthdayBonus}U` : '-'
        }))
      }
    }
  } catch (e) {
    console.warn('VIP API failed, using default data', e)
  }
})
</script>

<style lang="scss" scoped>
.page-content { padding: 16px; }
.vip-header {
  position: relative;
  overflow: hidden;
  background: $glass-bg;
  border: $glass-border;
  backdrop-filter: blur($glass-blur);
  -webkit-backdrop-filter: blur($glass-blur);
  border-radius: $radius-lg;
  padding: 24px;
  margin-bottom: 20px;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(500px 180px at 20% 0%, rgba(201, 166, 84, 0.22), transparent 65%);
    pointer-events: none;
  }
  > * { position: relative; z-index: 1; }
}
.current-vip { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
.vip-icon { font-size: 32px; filter: drop-shadow(0 2px 8px rgba(201, 166, 84, 0.6)); }
.vip-level {
  font-size: 24px; font-weight: 800;
  background: $gold-gradient;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 0.5px;
}
.vip-progress :deep(.van-progress) {
  background: rgba(255, 255, 255, 0.08) !important;
  border: 1px solid rgba(201, 166, 84, 0.15);
  .van-progress__portion { background: $gold-gradient-horizontal !important; box-shadow: 0 0 10px rgba(201,166,84,0.5); }
}
.progress-text { font-size: 11px; color: $text-muted; margin-top: 6px; display: block; font-family: $font-mono; }
.vip-benefits { margin-bottom: 20px; h3 { font-size: 16px; font-weight: 700; margin-bottom: 12px; color: $text-primary; } }
.benefit-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.benefit-item {
  background: $glass-bg;
  border: $glass-border;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: $radius-md;
  padding: 14px 8px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.benefit-icon { font-size: 24px; }
.benefit-label { font-size: 11px; color: $text-secondary; }
.vip-table-section { margin-bottom: 20px; h3 { font-size: 16px; font-weight: 700; margin-bottom: 12px; color: $text-primary; } }
.vip-table {
  background: $glass-bg;
  border: $glass-border;
  backdrop-filter: blur($glass-blur);
  -webkit-backdrop-filter: blur($glass-blur);
  border-radius: $radius-md;
  overflow: hidden;
}
.table-header { display: grid; grid-template-columns: 1fr 1.2fr 1.2fr 1.2fr 1fr; padding: 10px 8px; font-size: 10px; color: $text-muted; border-bottom: 1px solid rgba(255,255,255,0.06); }
.table-row { display: grid; grid-template-columns: 1fr 1.2fr 1.2fr 1.2fr 1fr; padding: 10px 8px; font-size: 11px; color: $text-secondary; border-bottom: 1px solid rgba(255,255,255,0.04);
  &.current { background: rgba(201, 166, 84, 0.14); color: $text-primary; }
  &:last-child { border-bottom: none; }
}
.level-badge {
  font-weight: 800;
  background: $gold-gradient;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.gold {
  font-weight: 700;
  background: $gold-gradient;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.vip-rules { h3 { font-size: 16px; font-weight: 700; margin-bottom: 12px; color: $text-primary; } }
.rules-content {
  background: $glass-bg;
  border: $glass-border;
  backdrop-filter: blur($glass-blur);
  -webkit-backdrop-filter: blur($glass-blur);
  border-radius: $radius-md;
  padding: 16px;
  p { font-size: 13px; color: $text-secondary; line-height: 2; }
}
</style>
