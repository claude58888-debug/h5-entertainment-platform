<template>
  <div class="games-page">
    <van-nav-bar
      :title="pageTitle"
      left-arrow
      @click-left="$router.back()"
      fixed
      :style="{ maxWidth: '480px', margin: '0 auto' }"
    />
    <div class="games-content" style="padding-top: 46px;">
      <!-- Provider filter tabs -->
      <div class="provider-tabs hide-scrollbar" v-if="currentProviders.length > 0">
        <div
          class="provider-tab"
          :class="{ active: activeProvider === 'all' }"
          @click="activeProvider = 'all'"
        >
          全部
        </div>
        <div
          v-for="p in currentProviders"
          :key="p.id"
          class="provider-tab"
          :class="{ active: activeProvider === p.id }"
          @click="activeProvider = p.id"
        >
          {{ p.name }}
        </div>
      </div>

      <!-- Search bar for hot tab -->
      <div class="search-bar" v-if="category === 'hot'">
        <van-field
          v-model="searchQuery"
          placeholder="搜索游戏..."
          left-icon="search"
          clearable
          class="search-input"
        />
      </div>

      <!-- Provider cards view (when 'all' is selected and not searching) -->
      <div v-if="activeProvider === 'all' && !searchQuery && currentProviders.length > 0" class="provider-grid">
        <div
          v-for="p in currentProviders"
          :key="p.id"
          class="provider-card-large"
          :style="{ background: p.gradient }"
          @click="activeProvider = p.id"
        >
          <div class="provider-card-info">
            <span class="provider-card-name">{{ p.name }}</span>
            <span class="provider-card-label">{{ p.label }}</span>
            <span class="provider-card-count">{{ p.gameCount }} 款游戏</span>
          </div>
          <div class="provider-card-deco">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" opacity="0.12">
              <circle cx="40" cy="40" r="35" stroke="white" stroke-width="2"/>
              <circle cx="40" cy="40" r="20" stroke="white" stroke-width="2"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Games grid -->
      <div v-else>
        <div class="games-count" v-if="filteredGames.length > 0">
          共 {{ filteredGames.length }} 款游戏
        </div>
        <div class="games-grid">
          <GameCard v-for="game in filteredGames" :key="game.id" :game="game" />
        </div>
      </div>

      <div v-if="!filteredGames.length && (activeProvider !== 'all' || searchQuery)" class="empty-state">
        <span class="empty-icon">🎮</span>
        <p>暂无游戏</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useGameStore } from '@/stores/game'
import GameCard from '@/components/home/GameCard.vue'

const { t } = useI18n()
const route = useRoute()
const gameStore = useGameStore()
const activeProvider = ref('all')
const searchQuery = ref('')

const category = computed(() => route.params.category)

const titleMap = {
  hot: '热门游戏',
  slots: '电子游戏',
  live: '真人视讯',
  fishing: '捕鱼游戏',
  lottery: '彩票',
  sports: '体育竞猜',
  chess: '棋牌游戏',
  video: '人人影视'
}

const pageTitle = computed(() => titleMap[category.value] || '全部游戏')

const currentProviders = computed(() => {
  return gameStore.getProvidersByCategory(category.value)
})

const allCategoryGames = computed(() => {
  if (category.value === 'hot') {
    return gameStore.hotGames
  }
  return gameStore.getGamesByCategory(category.value)
})

const filteredGames = computed(() => {
  let games = allCategoryGames.value
  if (activeProvider.value !== 'all') {
    games = games.filter(g => g.provider === activeProvider.value)
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    games = games.filter(g => g.name.toLowerCase().includes(q) || g.provider.toLowerCase().includes(q))
  }
  return games
})

watch(category, () => {
  activeProvider.value = 'all'
  searchQuery.value = ''
})

watch(() => route.query.provider, (provider) => {
  if (provider) {
    activeProvider.value = provider
  }
}, { immediate: true })

onMounted(() => {
  gameStore.fetchGames()
  if (route.query.provider) {
    activeProvider.value = route.query.provider
  }
})
</script>

<style lang="scss" scoped>
.games-page {
  min-height: 80vh;
}

.games-content {
  padding: 12px;
}

.provider-tabs {
  display: flex;
  overflow-x: auto;
  gap: 8px;
  margin-bottom: 14px;
  padding-bottom: 4px;
}

.provider-tab {
  flex-shrink: 0;
  padding: 6px 16px;
  border-radius: 20px;
  background: $bg-card;
  font-size: 13px;
  color: $text-secondary;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &.active {
    background: $accent-purple;
    color: #fff;
    font-weight: 600;
  }
}

.search-bar {
  margin-bottom: 14px;

  .search-input {
    background: $bg-card;
    border-radius: 10px;

    :deep(.van-field__left-icon) {
      color: $text-muted;
    }
  }
}

.provider-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 16px;
}

.provider-card-large {
  border-radius: 12px;
  padding: 16px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  min-height: 100px;
  display: flex;
  align-items: flex-end;
  transition: transform 0.2s;

  &:active {
    transform: scale(0.97);
  }
}

.provider-card-info {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.provider-card-name {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
}

.provider-card-label {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
}

.provider-card-count {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 4px;
}

.provider-card-deco {
  position: absolute;
  right: -10px;
  top: -10px;
  z-index: 1;
}

.games-count {
  font-size: 12px;
  color: $text-muted;
  margin-bottom: 10px;
}

.games-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;

  :deep(.game-card) {
    width: 100%;
    .card-image {
      width: 100%;
      height: 0;
      padding-bottom: 133%;
    }
  }
}

.empty-state {
  text-align: center;
  padding: 60px 0;
  color: $text-muted;

  .empty-icon {
    font-size: 48px;
    display: block;
    margin-bottom: 12px;
  }
}
</style>
