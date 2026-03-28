<template>
  <div class="category-tabs-wrapper">
    <div class="category-tabs hide-scrollbar" ref="tabsRef" @scroll="checkScroll">
      <div
        v-for="cat in categories"
        :key="cat.id"
        class="tab-item"
        :class="{ active: activeCategory === cat.id }"
        @click="$emit('change', cat.id)"
      >
        <span class="tab-icon-wrap">
          <svg v-if="cat.icon === 'home'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
          <svg v-else-if="cat.icon === 'recent'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <svg v-else-if="cat.icon === 'fire'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2c1 4-2 6-2 10a4 4 0 108 0c0-4-3-6-2-10"/></svg>
          <svg v-else-if="cat.icon === 'slots'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M8 4v16M16 4v16"/></svg>
          <svg v-else-if="cat.icon === 'live'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
          <svg v-else-if="cat.icon === 'fish'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6.5 12c3-6 11-6 14 0-3 6-11 6-14 0z"/><circle cx="16" cy="12" r="1" fill="currentColor"/></svg>
          <svg v-else-if="cat.icon === 'lottery'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          <svg v-else-if="cat.icon === 'sports'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 000 20 14.5 14.5 0 000-20M2 12h20"/></svg>
          <svg v-else-if="cat.icon === 'chess'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 16l-2 4h12l-2-4"/><path d="M12 4v4M9 8h6M8 8c0 4-4 6-4 12h16c0-6-4-8-4-12"/></svg>
          <svg v-else-if="cat.icon === 'video'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/></svg>
        </span>
        <span class="tab-label">{{ $t(cat.labelKey) }}</span>
      </div>
    </div>
    <div v-if="canScrollRight" class="scroll-fade-right"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useGameStore } from '@/stores/game'

const gameStore = useGameStore()

defineProps({
  activeCategory: { type: String, default: 'home' }
})

defineEmits(['change'])

const categories = gameStore.categories
const tabsRef = ref(null)
const canScrollRight = ref(true)

function checkScroll() {
  if (!tabsRef.value) return
  const el = tabsRef.value
  canScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 10
}

onMounted(() => {
  nextTick(() => checkScroll())
})
</script>

<style lang="scss" scoped>
.category-tabs-wrapper {
  position: sticky;
  top: $header-height;
  z-index: 50;
  background: $bg-primary;
  padding: 2px 0;
}

.category-tabs {
  display: flex;
  overflow-x: auto;
  padding: 0 10px;
  gap: 6px;
}

.tab-item {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 16px;
  background: rgba(255,255,255,0.06);
  color: $text-secondary;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &.active {
    background: linear-gradient(135deg, rgba(#6c5ce7, 0.3), rgba(#a855f7, 0.3));
    color: $accent-purple-light;
    border: 1px solid rgba($accent-purple-light, 0.3);
  }

  &:not(.active) {
    border: 1px solid transparent;
  }
}

.tab-icon-wrap {
  display: flex;
  align-items: center;
}

.scroll-fade-right {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 40px;
  background: linear-gradient(to right, transparent, $bg-primary);
  pointer-events: none;
  z-index: 10;
}
</style>
