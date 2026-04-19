<template>
  <div class="category-tabs-wrapper">
    <div class="category-tabs hide-scrollbar" ref="tabsRef" @scroll="checkScroll">
      <button
        v-for="cat in categories"
        :key="cat.id"
        class="tab-item"
        :class="{ active: activeCategory === cat.id }"
        @click="$emit('change', cat.id)"
      >
        <span class="tab-icon-wrap" v-if="cat.icon">
          <svg v-if="cat.icon === 'home'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5L12 3l9 7.5V20a1.5 1.5 0 0 1-1.5 1.5H4.5A1.5 1.5 0 0 1 3 20z"/></svg>
          <svg v-else-if="cat.icon === 'fire'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2c1 4-2 6-2 10a4 4 0 1 0 8 0c0-4-3-6-2-10"/></svg>
          <svg v-else-if="cat.icon === 'slots'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M8 4v16M16 4v16"/></svg>
          <svg v-else-if="cat.icon === 'live'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
          <svg v-else-if="cat.icon === 'fish'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 12c3-6 11-6 14 0-3 6-11 6-14 0z"/><circle cx="16" cy="12" r="1" fill="currentColor"/></svg>
          <svg v-else-if="cat.icon === 'lottery'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          <svg v-else-if="cat.icon === 'sports'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20M2 12h20"/></svg>
          <svg v-else-if="cat.icon === 'chess'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M8 16l-2 4h12l-2-4"/><path d="M12 4v4M9 8h6M8 8c0 4-4 6-4 12h16c0-6-4-8-4-12"/></svg>
          <svg v-else-if="cat.icon === 'video'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M10 8l6 4-6 4V8z"/></svg>
          <svg v-else-if="cat.icon === 'crash'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18L10 11L14 15L21 7"/><path d="M15 7h6v6"/></svg>
        </span>
        <span class="tab-label">{{ cat.labelKey ? $t(cat.labelKey) : cat.label }}</span>
      </button>
    </div>
    <div v-if="canScrollRight" class="scroll-fade-right" aria-hidden="true"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from 'vue'
import { useGameStore } from '@/stores/game'

const gameStore = useGameStore()

defineProps({
  activeCategory: { type: String, default: 'home' }
})

defineEmits(['change'])

// Stake-inspired category list: 全部/老虎机/真人/体育/彩票/捕鱼/Crash plus chess/video from platform
const STAKE_CATEGORIES = [
  { id: 'home', labelKey: 'categories.all', icon: 'home' },
  { id: 'slots', labelKey: 'categories.slots', icon: 'slots' },
  { id: 'live', labelKey: 'categories.live', icon: 'live' },
  { id: 'sports', labelKey: 'categories.sports', icon: 'sports' },
  { id: 'lottery', labelKey: 'categories.lottery', icon: 'lottery' },
  { id: 'fishing', labelKey: 'categories.fishing', icon: 'fish' },
  { id: 'crash', labelKey: 'categories.crash', icon: 'crash' },
  { id: 'chess', labelKey: 'home.chess', icon: 'chess' },
  { id: 'video', labelKey: 'home.video', icon: 'video' }
]

const categories = computed(() => {
  // Prefer Stake categories but keep store-supplied extras (tolerant of backend changes)
  const storeIds = new Set((gameStore.categories || []).map(c => c.id))
  const extras = (gameStore.categories || [])
    .filter(c => !STAKE_CATEGORIES.some(s => s.id === c.id))
    .map(c => ({ id: c.id, labelKey: c.labelKey, icon: c.icon }))
  // If store categories exist, keep Stake ordering and append anything extra
  return storeIds.size ? [...STAKE_CATEGORIES, ...extras] : STAKE_CATEGORIES
})

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
  padding: 8px 0;
  border-bottom: 1px solid $border-subtle;
}

.category-tabs {
  display: flex;
  overflow-x: auto;
  padding: 0 12px;
  gap: 6px;
}

.tab-item {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: $radius-md;
  background: $bg-card;
  color: $text-secondary;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
  white-space: nowrap;
  border: 1px solid transparent;

  &:hover {
    background: $bg-card-hover;
    color: $text-primary;
  }

  &.active {
    background: $bg-card-hover;
    color: $accent-gold;
    border-color: rgba(212, 168, 67, 0.3);
  }
}

.tab-icon-wrap {
  display: inline-flex;
  align-items: center;
}

.scroll-fade-right {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 28px;
  background: linear-gradient(to right, transparent, $bg-primary);
  pointer-events: none;
  z-index: 10;
}
</style>
