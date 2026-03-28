<template>
  <div class="section-header">
    <div class="section-left">
      <span class="section-icon" v-if="icon">{{ icon }}</span>
      <h3 class="section-title">{{ title }}</h3>
    </div>
    <div class="section-right">
      <div class="scroll-arrows" v-if="scrollable">
        <button class="arrow-btn" @click="$emit('scroll-left')">&lt;</button>
        <button class="arrow-btn" @click="$emit('scroll-right')">&gt;</button>
      </div>
      <router-link v-if="more" :to="more" class="section-more">&gt;</router-link>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  icon: { type: String, default: '' },
  more: { type: String, default: '' },
  scrollable: { type: Boolean, default: false }
})

defineEmits(['scroll-left', 'scroll-right'])
</script>

<style lang="scss" scoped>
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 12px 8px;
  border-left: 3px solid $accent-gold;
  margin-left: 0;
  padding-left: 8px;
  margin-right: 0;
}

.section-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.section-icon {
  font-size: 16px;
}

.section-title {
  font-size: 15px;
  font-weight: 700;
  color: #fff;
}

.section-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.scroll-arrows {
  display: flex;
  gap: 4px;
}

.arrow-btn {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.15);
  color: $text-secondary;
  font-size: 11px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:active {
    background: rgba(255,255,255,0.15);
  }
}

.section-more {
  font-size: 14px;
  color: $text-muted;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255,255,255,0.08);
}
</style>
