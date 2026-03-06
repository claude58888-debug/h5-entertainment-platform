<template>
  <div class="coming-soon-card">
    <div class="card-content">
      <span class="icon">🔮</span>
      <span class="text">{{ t('common.comingSoon') }}</span>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<style lang="scss" scoped>
.coming-soon-card {
  width: $provider-card-width;
  height: $provider-card-height;
  flex-shrink: 0;
  border-radius: 12px;
  background: $bg-card;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed $border-color;
}

.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.icon { font-size: 28px; }
.text {
  font-size: 12px;
  color: $text-muted;
}
</style>
