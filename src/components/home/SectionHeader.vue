<template>
  <div class="section-header">
    <div class="section-left">
      <span class="section-icon" v-if="icon">{{ icon }}</span>
      <h3 class="section-title">{{ title }}</h3>
    </div>
    <router-link v-if="more" :to="more" class="section-more">
      {{ t('home.viewAll') }} →
    </router-link>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps({
  title: { type: String, required: true },
  icon: { type: String, default: '' },
  more: { type: String, default: '' }
})
</script>

<style lang="scss" scoped>
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 12px 10px;
}

.section-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.section-icon {
  font-size: 18px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
}

.section-more {
  font-size: 12px;
  color: $accent-purple-light;
}
</style>
