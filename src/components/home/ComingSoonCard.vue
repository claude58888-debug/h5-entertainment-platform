<template>
  <div class="coming-soon-card">
    <div class="card-content">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 6v6l4 2"/>
      </svg>
      <span class="text">{{ $t('common.comingSoon') }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.coming-soon-card {
  width: 140px;
  height: 90px;
  flex-shrink: 0;
  border-radius: 12px;
  background: rgba(255,255,255,0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed rgba(255,255,255,0.1);
}

.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.text {
  font-size: 11px;
  color: $text-muted;
}
</style>
