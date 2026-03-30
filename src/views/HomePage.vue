<template>
  <van-pull-refresh v-model="refreshing" @refresh="onRefresh" :pulling-text="$t('common.pullRefresh')" :loosing-text="$t('common.releaseRefresh')" :loading-text="$t('common.refreshing')">
    <div class="home-page">
      <!-- Skeleton Loading State -->
      <template v-if="pageLoading && !hasData">
        <div class="skeleton-section">
          <van-skeleton :row="0" :loading="true">
            <template #template>
              <div class="skeleton-banner"></div>
            </template>
          </van-skeleton>
          <div class="skeleton-actions">
            <div class="skeleton-action-item" v-for="i in 5" :key="'qa'+i"></div>
          </div>
          <div class="skeleton-tabs">
            <div class="skeleton-tab" v-for="i in 6" :key="'tab'+i"></div>
          </div>
          <div class="skeleton-section-header">
            <van-skeleton title :row="0" title-width="120px" :loading="true" />
          </div>
          <div class="skeleton-games-row">
            <div class="skeleton-game-card" v-for="i in 4" :key="'game'+i"></div>
          </div>
          <div class="skeleton-section-header">
            <van-skeleton title :row="0" title-width="100px" :loading="true" />
          </div>
          <div class="skeleton-games-row">
            <div class="skeleton-provider-card" v-for="i in 3" :key="'prov'+i"></div>
          </div>
        </div>
      </template>

      <!-- Network Error Retry State -->
      <template v-else-if="hasError && !hasData">
        <van-empty class="error-empty" image="network" description="网络连接失败，请重试">
          <van-button type="primary" round size="small" @click="retryLoad">重新加载</van-button>
        </van-empty>
      </template>

      <!-- Main Content -->
      <template v-else>
        <!-- Banner -->
        <BannerSwiper />

        <!-- Scrolling Announcement Bar (below banner) -->
        <AppNotice />

        <!-- Quick Actions -->
        <QuickActions />

        <!-- Category Tabs -->
        <GameCategoryTabs :active-category="activeCategory" @change="onCategoryChange" />

        <!-- Content based on active category -->
        <template v-if="activeCategory === 'home'">
          <!-- Hot Games -->
        <SectionHeader :title="$t('home.hot')" icon="🔥" more="/games/hot" :scrollable="true" @scroll-left="scrollHot(-1)" @scroll-right="scrollHot(1)" />
        <div class="scroll-row hide-scrollbar" ref="hotScrollRef">
          <GameCard v-for="game in hotGames" :key="game.id" :game="game" />
        </div>

        <!-- Slots -->
        <SectionHeader :title="$t('home.slots')" icon="🎰" more="/games/slots" :scrollable="true" />
        <div class="scroll-row hide-scrollbar">
          <ProviderCard v-for="p in slotsProviders" :key="p.id" :provider="p" category="slots" />
        </div>

        <!-- Live -->
        <SectionHeader :title="$t('home.live')" icon="🎲" more="/games/live" :scrollable="true" />
        <div class="scroll-row hide-scrollbar">
          <ProviderCard v-for="p in liveProviders" :key="p.id" :provider="p" category="live" />
        </div>

        <!-- Fishing -->
        <SectionHeader :title="$t('home.fishing')" icon="🐟" more="/games/fishing" :scrollable="true" />
        <div class="scroll-row hide-scrollbar">
          <ProviderCard v-for="p in fishingProviders" :key="p.id" :provider="p" category="fishing" />
        </div>

        <!-- Lottery -->
        <SectionHeader :title="$t('home.lottery')" icon="🎱" more="/games/lottery" :scrollable="true" />
        <div class="scroll-row hide-scrollbar">
          <ProviderCard v-for="p in lotteryProviders" :key="p.id" :provider="p" category="lottery" />
        </div>

        <!-- Sports -->
        <SectionHeader :title="$t('home.sports')" icon="⚽" more="/games/sports" :scrollable="true" />
        <div class="scroll-row hide-scrollbar">
          <ProviderCard v-for="p in sportsProviders" :key="p.id" :provider="p" category="sports" />
        </div>

        <!-- Chess -->
        <SectionHeader :title="$t('home.chess')" icon="♟️" more="/games/chess" :scrollable="true" />
        <div class="scroll-row hide-scrollbar">
          <ProviderCard v-for="p in chessProviders" :key="p.id" :provider="p" category="chess" />
        </div>

        <!-- Video -->
        <SectionHeader :title="$t('home.video')" icon="🎬" />
        <div class="scroll-row hide-scrollbar">
          <ProviderCard v-for="p in videoProviders" :key="p.id" :provider="p" category="video" />
        </div>

        <!-- Crypto Section -->
        <div class="crypto-header">
          <h3>{{ $t('home.buyCrypto') }}</h3>
          <button class="vpn-btn" @click="$router.push('/softwareDownload')">{{ $t('home.recommendVPN') }}</button>
        </div>
        <div class="crypto-section">
          <a href="https://www.huobi.com" target="_blank" class="crypto-link">
            <img src="/img/crypto/huobi.svg" alt="HTX" class="crypto-img" />
            <span>火币网</span>
          </a>
          <a href="https://www.binance.com" target="_blank" class="crypto-link">
            <img src="/img/crypto/binance.svg" alt="BINANCE" class="crypto-img" />
            <span>币安</span>
          </a>
          <a href="https://www.okx.com" target="_blank" class="crypto-link">
            <img src="/img/crypto/okex.svg" alt="OKEX" class="crypto-img" />
            <span>欧易</span>
          </a>
        </div>

        <!-- Partners -->
        <SectionHeader :title="$t('home.gamePartners')" icon="🤝" />
        <div class="partners-section">
          <div class="partner-logo">
            <img src="/img/providers/provider_evo.png" alt="EVO" />
          </div>
          <div class="partner-logo">
            <img src="/img/providers/provider_gfg.png" alt="GFG" />
          </div>
          <div class="partner-logo">
            <img src="/img/providers/provider_pg.png" alt="PG" />
          </div>
          <div class="partner-logo">
            <img src="/img/providers/provider_pp.png" alt="PP" />
          </div>
          <div class="partner-logo">
            <img src="/img/providers/provider_wm.png" alt="WM" />
          </div>
        </div>

        <!-- License -->
        <div class="license-section">
          <div class="license-badges">
            <img src="/img/misc/game_provider.png" alt="Gaming Curacao" class="license-img" />
            <div class="license-badge age-badge">
              <span>18+</span>
            </div>
          </div>
          <p class="license-text">Licensed and regulated by the Government of Curacao. Play responsibly.</p>
        </div>
      </template>

        <!-- Category specific view -->
        <template v-else>
          <div class="category-games">
            <GameCard v-for="game in categoryGames" :key="game.id" :game="game" />
          </div>
          <div v-if="!categoryGames.length" class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M12 12h.01"/></svg>
            <p>{{ $t('common.upcomingOnline') }}</p>
          </div>
        </template>
      </template>
    </div>
  </van-pull-refresh>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { useGameStore } from '@/stores/game'
import { showToast } from 'vant'

import AppNotice from '@/components/common/AppNotice.vue'
import BannerSwiper from '@/components/home/BannerSwiper.vue'
import QuickActions from '@/components/home/QuickActions.vue'
import GameCategoryTabs from '@/components/home/GameCategoryTabs.vue'
import SectionHeader from '@/components/home/SectionHeader.vue'
import GameCard from '@/components/home/GameCard.vue'
import ProviderCard from '@/components/home/ProviderCard.vue'

const appStore = useAppStore()
const gameStore = useGameStore()

const activeCategory = ref('home')
const refreshing = ref(false)
const hotScrollRef = ref(null)
const hasError = ref(false)

const pageLoading = computed(() => appStore.loading || gameStore.loading)
const hasData = computed(() => gameStore.games.length > 0)

const hotGames = computed(() => gameStore.hotGames)
const slotsProviders = computed(() => gameStore.getProvidersByCategory('slots'))
const liveProviders = computed(() => gameStore.getProvidersByCategory('live'))
const fishingProviders = computed(() => gameStore.getProvidersByCategory('fishing'))
const lotteryProviders = computed(() => gameStore.getProvidersByCategory('lottery'))
const sportsProviders = computed(() => gameStore.getProvidersByCategory('sports'))
const chessProviders = computed(() => gameStore.getProvidersByCategory('chess'))
const videoProviders = computed(() => gameStore.getProvidersByCategory('video'))

const categoryGames = computed(() => gameStore.getGamesByCategory(activeCategory.value))

function onCategoryChange(category) {
  activeCategory.value = category
}

function scrollHot(direction) {
  if (hotScrollRef.value) {
    hotScrollRef.value.scrollBy({ left: direction * 200, behavior: 'smooth' })
  }
}

async function loadData() {
  hasError.value = false
  try {
    await Promise.all([appStore.initApp(), gameStore.fetchGames()])
  } catch (e) {
    hasError.value = true
    showToast({ message: '加载失败，请检查网络', position: 'bottom' })
  }
}

async function onRefresh() {
  hasError.value = false
  try {
    await Promise.all([appStore.initApp(), gameStore.fetchGames()])
  } catch (e) {
    showToast({ message: '刷新失败，请重试', position: 'bottom' })
  }
  refreshing.value = false
}

function retryLoad() {
  loadData()
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.home-page {
  padding-bottom: 20px;
}

/* Skeleton loading styles */
.skeleton-section {
  padding: 0 12px;
}

.skeleton-banner {
  width: 100%;
  height: 160px;
  border-radius: 12px;
  background: $bg-card;
  margin: 12px 0;
}

.skeleton-actions {
  display: flex;
  gap: 10px;
  padding: 12px 0;
}

.skeleton-action-item {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: $bg-card;
}

.skeleton-tabs {
  display: flex;
  gap: 8px;
  padding: 8px 0;
  overflow-x: auto;
}

.skeleton-tab {
  width: 56px;
  height: 32px;
  border-radius: 16px;
  background: $bg-card;
  flex-shrink: 0;
}

.skeleton-section-header {
  padding: 16px 0 8px;
}

.skeleton-games-row {
  display: flex;
  gap: 10px;
  padding: 4px 0;
}

.skeleton-game-card {
  width: 105px;
  height: 140px;
  border-radius: 10px;
  background: $bg-card;
  flex-shrink: 0;
}

.skeleton-provider-card {
  width: 140px;
  height: 100px;
  border-radius: 10px;
  background: $bg-card;
  flex-shrink: 0;
}

.error-empty {
  padding: 80px 0;

  :deep(.van-empty__description) {
    color: $text-muted;
  }
}

.scroll-row {
  display: flex;
  overflow-x: auto;
  padding: 0 12px;
  gap: 10px;
}

.category-games {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  padding: 0 12px;
}

.empty-state {
  text-align: center;
  padding: 60px 0;
  color: $text-muted;

  p { margin-top: 12px; }
}


.crypto-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 12px 12px;

  h3 {
    font-size: 15px;
    font-weight: 700;
  }
}

.vpn-btn {
  padding: 4px 12px;
  border-radius: 14px;
  background: linear-gradient(135deg, #6c5ce7, #a855f7);
  color: #fff;
  border: none;
  font-size: 11px;
  cursor: pointer;
}

.crypto-section {
  display: flex;
  justify-content: space-around;
  padding: 0 12px;
  gap: 12px;
}

.crypto-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
  padding: 16px 0;
  border-radius: 12px;
  background: rgba(255,255,255,0.04);
  font-size: 12px;
  color: $text-secondary;
}

.crypto-img {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.partners-section {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 8px 12px;
}

.partner-logo {
  flex: 1;
  min-width: 60px;
  height: 40px;
  border-radius: 8px;
  background: rgba(255,255,255,0.04);
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    height: 24px;
    object-fit: contain;
    opacity: 0.7;
  }
}

.license-img {
  height: 50px;
  object-fit: contain;
}

.license-section {
  margin: 28px 12px 0;
  text-align: center;
  padding: 20px 0;
  border-top: 1px solid $border-color;
}

.license-badges {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 12px;
  align-items: center;
}

.license-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: $text-muted;
}

.age-badge {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  color: rgba(255,255,255,0.5);
}

.badge-text {
  font-size: 11px;
}

.license-text {
  font-size: 10px;
  color: $text-muted;
  line-height: 1.5;
}
</style>
