<template>
  <router-link :to="to" class="qa" :class="`qa--${tone}`">
    <div class="qa__icon">
      <el-icon><component :is="icon" /></el-icon>
    </div>
    <div class="qa__label">{{ label }}</div>
    <el-icon class="qa__chev"><ArrowRight /></el-icon>
  </router-link>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  icon: { type: String, required: true },
  to: { type: String, required: true },
  tone: { type: String, default: 'a' },
})
</script>

<style lang="scss" scoped>
$gold: #d4af37;
$gold-soft: #e8c87a;
$gold-deep: #b8902c;
$line: rgba(212, 175, 55, 0.18);

.qa {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 12px;
  border-radius: 10px;
  border: 1px solid $line;
  background: rgba(10,14,23,0.5);
  color: #f4ead0; text-decoration: none;
  transition: all 0.18s ease;

  &:hover {
    border-color: rgba(212,175,55,0.5);
    background: linear-gradient(135deg, rgba(212,175,55,0.12), rgba(212,175,55,0.04));
    transform: translateY(-1px);
    box-shadow: 0 10px 24px rgba(212,175,55,0.15);
    .qa__chev { transform: translateX(3px); color: $gold; }
  }
}
.qa__icon {
  width: 34px; height: 34px; border-radius: 9px; flex: 0 0 34px;
  display: grid; place-items: center;
  background: linear-gradient(135deg, rgba(212,175,55,0.28), rgba(212,175,55,0.08));
  color: $gold-soft;
  .el-icon { font-size: 16px; }
}
.qa__label { flex: 1; font-size: 13px; font-weight: 600; letter-spacing: 0.04em; }
.qa__chev {
  font-size: 14px; color: rgba(244,234,208,0.4);
  transition: transform 0.18s ease, color 0.18s ease;
}
</style>
