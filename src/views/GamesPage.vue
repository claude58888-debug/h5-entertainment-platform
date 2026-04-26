<template>
  <div class="games-page">
    <van-nav-bar
      :title="pageTitle"
      left-arrow
      @click-left="$router.back()"
      fixed
      :style="{ maxWidth: '480px', margin: '0 auto' }"
    />
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh" :pulling-text="$t('common.pullRefresh')" :loosing-text="$t('common.releaseRefresh')" :loading-text="$t('common.refreshing')">
    <div class="games-content" style="padding-top: 46px;">
      <!-- Skeleton Loading State -->
      <template v-if="gameStore.loading && !hasData">
        <div class="skeleton-tabs-row">
          <div class="skeleton-tab-item" v-for="i in 5" :key="'st'+i"></div>
        </div>
        <div class="skeleton-grid">
          <div class="skeleton-game-item" v-for="i in 9" :key="'sg'+i"></div>
        </div>
      </template>

      <!-- Error State -->
      <template v-else-if="hasError && !hasData">
        <van-empty class="error-empty" image="network" :description="t('games.loadFailed')">
          <van-button type="primary" round size="small" @click="retryLoad">{{ t('common.reload') }}</van-button>
        </van-empty>
      </template>

      <template v-else>
        <!-- Provider filter tabs -->
        <div class="provider-tabs hide-scrollbar" v-if="currentProviders.length > 0">
          <div
            class="provider-tab"
            :class="{ active: activeProvider === 'all' }"
            @click="activeProvider = 'all'"
          >
            {{ t('games.allGames') }}
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

        <!-- Search bar -->
        <div class="search-bar">
          <van-field
            v-model="searchQuery"
            :placeholder="t('games.searchPlaceholder')"
            left-icon="search"
            clearable
            class="search-input"
          />
        </div>

        <!-- Provider cards view (when 'all' is selected and not searching) -->
        <div v-if="activeProvider === 'all' && !searchQuery && currentProviders.length > 0">
          <div class="provider-grid">
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
                <span class="provider-card-count">{{ t('games.gamesCount', { count: p.gameCount }) }}</span>
              </div>
              <div class="provider-card-deco">
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none" opacity="0.12">
                  <circle cx="40" cy="40" r="35" stroke="white" stroke-width="2"/>
                  <circle cx="40" cy="40" r="20" stroke="white" stroke-width="2"/>
                </svg>
              </div>
            </div>
          </div>

          <!-- SK7755 games section below provider cards -->
          <div v-if="sk7755CategoryGames.length > 0" class="sk7755-section">
            <div class="sk7755-section-header">
              <span class="sk7755-section-title">SK7755 {{ pageTitle }}</span>
              <span class="sk7755-section-count">{{ sk7755CategoryGames.length }} {{ t('games.gamesUnit') || '款' }}</span>
            </div>
            <div class="games-grid">
              <GameCard v-for="game in sk7755VisibleGames" :key="game.id" :game="game" />
            </div>
            <div v-if="sk7755CategoryGames.length > sk7755ShowCount" class="sk7755-load-more" @click="sk7755ShowCount += 18">
              {{ t('games.loadMore') || '加载更多' }}
            </div>
          </div>
        </div>

        <!-- Games grid with infinite scroll -->
        <div v-else>
          <div class="games-count" v-if="filteredGames.length > 0">
            {{ t('games.totalGames', { count: filteredGames.length }) }}
          </div>
          <van-list
            v-model:loading="listLoading"
            :finished="listFinished"
            :finished-text="t('games.noMoreData')"
            @load="onListLoad"
          >
            <div class="games-grid">
              <GameCard v-for="game in visibleGames" :key="game.id" :game="game" />
            </div>
          </van-list>
        </div>

        <div v-if="!filteredGames.length && (activeProvider !== 'all' || searchQuery)" class="empty-state">
          <span class="empty-icon">🎮</span>
          <p>{{ t('games.noGames') }}</p>
        </div>
      </template>
    </div>
    </van-pull-refresh>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useGameStore } from '@/stores/game'
import { showToast } from 'vant'
import GameCard from '@/components/home/GameCard.vue'

const { t } = useI18n()
const route = useRoute()
const gameStore = useGameStore()
const activeProvider = ref('all')
const searchQuery = ref('')
const hasError = ref(false)
const listLoading = ref(false)
const refreshing = ref(false)
const pageSize = 18
const currentPage = ref(1)

const category = computed(() => route.params.category)
const sk7755ShowCount = ref(18)

const titleMap = {
  hot: 'games.hot',
  slots: 'games.slots',
  live: 'games.live',
  fishing: 'games.fishing',
  lottery: 'games.lottery',
  sports: 'games.sports',
  chess: 'games.chess',
  video: 'games.video'
}

const pageTitle = computed(() => t(titleMap[category.value] || 'games.allGames'))

const currentProviders = computed(() => {
  return gameStore.getProvidersByCategory(category.value)
})

const allCategoryGames = computed(() => {
  if (category.value === 'hot') {
    return gameStore.hotGames
  }
  return gameStore.getGamesByCategory(category.value)
})

const sk7755CategoryGames = computed(() => {
  return gameStore.sk7755Games.filter(g => g.category === category.value)
})

const sk7755VisibleGames = computed(() => {
  return sk7755CategoryGames.value.slice(0, sk7755ShowCount.value)
})

const hasData = computed(() => allCategoryGames.value.length > 0 || sk7755CategoryGames.value.length > 0)

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

const visibleGames = computed(() => {
  return filteredGames.value.slice(0, currentPage.value * pageSize)
})

const listFinished = computed(() => {
  return visibleGames.value.length >= filteredGames.value.length
})

function onListLoad() {
  currentPage.value++
  listLoading.value = false
}

watch(category, () => {
  activeProvider.value = 'all'
  searchQuery.value = ''
  currentPage.value = 1
  sk7755ShowCount.value = 18
})

watch([activeProvider, searchQuery], () => {
  currentPage.value = 1
})

watch(() => route.query.provider, (provider) => {
  if (provider) {
    activeProvider.value = provider
  }
}, { immediate: true })

async function onRefresh() {
  hasError.value = false
  try {
    await gameStore.fetchGames()
  } catch (e) {
    showToast({ message: t('games.loadFailed'), position: 'bottom' })
  }
  refreshing.value = false
}

async function retryLoad() {
  hasError.value = false
  try {
    await gameStore.fetchGames()
  } catch (e) {
    hasError.value = true
    showToast({ message: t('games.loadFailed'), position: 'bottom' })
  }
}

onMounted(async () => {
  try {
    await gameStore.fetchGames()
  } catch (e) {
    hasError.value = true
  }
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

/* Skeleton loading styles */
.skeleton-tabs-row {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
}

.skeleton-tab-item {
  width: 64px;
  height: 32px;
  border-radius: 20px;
  background: $bg-card;
  flex-shrink: 0;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.skeleton-game-item {
  height: 0;
  padding-bottom: 133%;
  border-radius: 10px;
  background: $bg-card;
}

.error-empty {
  padding: 60px 0;

  :deep(.van-empty__description) {
    color: $text-muted;
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

.sk7755-section {
  margin-top: 16px;
}

.sk7755-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 0 2px;
}

.sk7755-section-title {
  font-size: 15px;
  font-weight: 600;
  color: #e6a23c;
}

.sk7755-section-count {
  font-size: 12px;
  color: $text-muted;
}

.sk7755-load-more {
  text-align: center;
  padding: 12px;
  color: #e6a23c;
  font-size: 13px;
  cursor: pointer;

  &:active {
    opacity: 0.7;
  }
}
</style>
