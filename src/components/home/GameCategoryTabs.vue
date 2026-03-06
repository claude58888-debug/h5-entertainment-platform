<template>
  <div class="category-tabs hide-scrollbar">
    <div
      v-for="cat in categories"
      :key="cat.id"
      class="tab-item"
      :class="{ active: activeCategory === cat.id }"
      @click="$emit('change', cat.id)"
    >
      <span class="tab-icon">{{ cat.icon }}</span>
      <span class="tab-label">{{ t(cat.key) }}</span>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useGameStore } from '@/stores/game'

const { t } = useI18n()
const gameStore = useGameStore()

defineProps({
  activeCategory: { type: String, default: 'home' }
})

defineEmits(['change'])

const categories = gameStore.categories
</script>

<style lang="scss" scoped>
.category-tabs {
  display: flex;
  overflow-x: auto;
  padding: 0 12px;
  gap: 4px;
  margin-bottom: 12px;
}

.tab-item {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  border-radius: 20px;
  background: $bg-card;
  color: $text-secondary;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &.active {
    background: $accent-purple;
    color: $text-primary;
  }
}

.tab-icon {
  font-size: 14px;
}
</style>
