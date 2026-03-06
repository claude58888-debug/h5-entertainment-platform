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
      <van-list
        v-model:loading="loading"
        :finished="finished"
        :finished-text="t('common.noMore')"
        @load="loadMore"
      >
        <div class="games-grid">
          <GameCard v-for="game in displayGames" :key="game.id" :game="game" />
        </div>
      </van-list>
      <div v-if="!displayGames.length && !loading" class="empty-state">
        <span class="empty-icon">🎮</span>
        <p>{{ t('common.comingSoon') }}</p>
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
const loading = ref(false)
const finished = ref(false)
const displayGames = ref([])
const page = ref(1)

const category = computed(() => route.params.category)

const titleMap = {
  hot: 'home.hotGames',
  slots: 'home.slots',
  live: 'home.live',
  fishing: 'home.fishing',
  lottery: 'home.lottery',
  sports: 'home.sports',
  chess: 'home.chess',
  video: 'home.video'
}

const pageTitle = computed(() => t(titleMap[category.value] || 'home.allGames'))

async function loadMore() {
  loading.value = true
  await gameStore.fetchGames({ category: category.value })
  const games = gameStore.getGamesByCategory(category.value)
  displayGames.value = games
  finished.value = true
  loading.value = false
}

watch(category, () => {
  displayGames.value = []
  finished.value = false
  page.value = 1
  loadMore()
})

onMounted(() => {
  loadMore()
})
</script>

<style lang="scss" scoped>
.games-page {
  min-height: 80vh;
}

.games-content {
  padding: 12px;
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
