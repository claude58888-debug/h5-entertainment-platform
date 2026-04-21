<template>
  <div class="kpi" :class="`kpi--${tone}`">
    <div class="kpi__icon">
      <el-icon><component :is="icon" /></el-icon>
    </div>
    <div class="kpi__body">
      <div class="kpi__title">{{ title }}</div>
      <div class="kpi__value">
        <span v-if="prefix" class="kpi__prefix">{{ prefix }}</span>
        {{ formatted }}
      </div>
      <div class="kpi__delta" :class="deltaClass">
        <el-icon v-if="deltaDirection === 'up'"><CaretTop /></el-icon>
        <el-icon v-else-if="deltaDirection === 'down'"><CaretBottom /></el-icon>
        <span>{{ deltaText }}</span>
        <span class="kpi__delta-sub">较昨日</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  value: { type: [Number, String], default: 0 },
  delta: { type: Number, default: 0 }, // percent, signed
  deltaInvert: { type: Boolean, default: false }, // true for "withdrawals" where down is good
  icon: { type: String, default: 'DataAnalysis' },
  tone: { type: String, default: 'a' }, // a | b | c | d | e
  prefix: { type: String, default: '' },
})

const formatted = computed(() => {
  const n = Number(props.value)
  if (Number.isNaN(n)) return props.value
  return n.toLocaleString('zh-CN')
})
const deltaDirection = computed(() => {
  if (!props.delta) return 'flat'
  return props.delta > 0 ? 'up' : 'down'
})
const deltaText = computed(() => {
  const abs = Math.abs(props.delta || 0)
  return `${abs.toFixed(1)}%`
})
const deltaClass = computed(() => {
  if (!props.delta) return 'kpi__delta--flat'
  const isUp = props.delta > 0
  const isGood = props.deltaInvert ? !isUp : isUp
  return isGood ? 'kpi__delta--good' : 'kpi__delta--bad'
})
</script>

<style lang="scss" scoped>
$gold: #d4af37;
$gold-soft: #e8c87a;
$gold-deep: #b8902c;
$line: rgba(212, 175, 55, 0.18);

.kpi {
  position: relative;
  padding: 18px;
  border-radius: 14px;
  border: 1px solid $line;
  background: linear-gradient(180deg, rgba(26,32,51,0.86) 0%, rgba(10,14,23,0.86) 100%);
  box-shadow: 0 20px 48px rgba(0,0,0,0.45);
  display: flex; gap: 14px; align-items: flex-start;
  overflow: hidden;
  transition: transform 0.18s ease, box-shadow 0.2s ease, border-color 0.2s ease;

  &::after {
    content: ''; position: absolute; right: -40px; top: -40px;
    width: 140px; height: 140px; border-radius: 50%;
    background: radial-gradient(circle, rgba(212,175,55,0.22), transparent 70%);
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(212,175,55,0.4);
    box-shadow: 0 26px 56px rgba(0,0,0,0.55), 0 0 0 1px rgba(212,175,55,0.18);
  }
}

.kpi__icon {
  width: 44px; height: 44px; border-radius: 12px; flex: 0 0 44px;
  display: grid; place-items: center;
  background: linear-gradient(135deg, $gold-soft, $gold 50%, $gold-deep);
  color: #05070d;
  box-shadow: 0 8px 18px rgba(212,175,55,0.3), inset 0 0 0 1px rgba(255,255,255,0.25);
  .el-icon { font-size: 22px; }
}

.kpi__body { flex: 1; min-width: 0; }
.kpi__title {
  font-size: 12px; letter-spacing: 0.14em; color: rgba(244,234,208,0.55);
  text-transform: uppercase; margin-bottom: 6px;
}
.kpi__value {
  font-size: 26px; font-weight: 800; letter-spacing: 0.02em;
  background: linear-gradient(135deg, #fff 0%, $gold-soft 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.kpi__prefix { font-size: 16px; margin-right: 4px; color: $gold-soft; -webkit-text-fill-color: $gold-soft; }

.kpi__delta {
  margin-top: 6px; display: inline-flex; align-items: center; gap: 4px;
  font-size: 12px; font-weight: 600;
  .el-icon { font-size: 12px; }
  &--good { color: #4ade80; }
  &--bad  { color: #f87171; }
  &--flat { color: rgba(244,234,208,0.55); }
}
.kpi__delta-sub { margin-left: 4px; color: rgba(244,234,208,0.4); font-weight: 400; }

// Per-tone accent hue (subtle, mostly gold-family)
.kpi--a .kpi__icon { background: linear-gradient(135deg, #e8c87a, #d4af37 50%, #b8902c); }
.kpi--b .kpi__icon { background: linear-gradient(135deg, #f5d98a, #e6b742 50%, #9c7a22); }
.kpi--c .kpi__icon { background: linear-gradient(135deg, #f1caa3, #d29a5a 50%, #8a5f2a); }
.kpi--d .kpi__icon { background: linear-gradient(135deg, #e8d29a, #c7a04a 50%, #8b6a1e); }
.kpi--e .kpi__icon { background: linear-gradient(135deg, #f4e1a1, #d8b74a 50%, #9e7c1f); }
</style>
