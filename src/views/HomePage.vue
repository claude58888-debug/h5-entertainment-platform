<template>
  <van-pull-refresh v-model="refreshing" @refresh="onRefresh" :pulling-text="t('common.pullRefresh')" :loosing-text="t('common.releaseRefresh')" :loading-text="t('common.refreshing')">
    <div class="home-page">
      <!-- Notice -->
      <AppNotice />

      <!-- Banner -->
      <BannerSwiper />

      <!-- Quick Actions -->
      <QuickActions />

      <!-- Category Tabs -->
      <GameCategoryTabs :active-category="activeCategory" @change="onCategoryChange" />

      <!-- Content based on active category -->
      <template v-if="activeCategory === 'home'">
        <!-- Hot Games -->
        <SectionHeader :title="t('home.hotGames')" icon="🔥" more="/games/hot" />
        <div class="scroll-row hide-scrollbar">
          <GameCard v-for="game in hotGames" :key="game.id" :game="game" />
        </div>

        <!-- Slots -->
        <SectionHeader :title="t('home.slots')" icon="🎰" more="/games/slots" />
        <div class="scroll-row hide-scrollbar">
          <ProviderCard v-for="p in slotsProviders" :key="p.id" :provider="p" category="slots" />
        </div>

        <!-- Live -->
        <SectionHeader :title="t('home.live')" icon="🎲" more="/games/live" />
        <div class="scroll-row hide-scrollbar">
          <ProviderCard v-for="p in liveProviders" :key="p.id" :provider="p" category="live" />
        </div>

        <!-- Fishing -->
        <SectionHeader :title="t('home.fishing')" icon="🐟" more="/games/fishing" />
        <div class="scroll-row hide-scrollbar">
          <ProviderCard v-for="p in fishingProviders" :key="p.id" :provider="p" category="fishing" />
        </div>

        <!-- Lottery -->
        <SectionHeader :title="t('home.lottery')" icon="🎱" more="/games/lottery" />
        <div class="scroll-row hide-scrollbar">
          <ProviderCard v-for="p in lotteryProviders" :key="p.id" :provider="p" category="lottery" />
        </div>

        <!-- Sports -->
        <SectionHeader :title="t('home.sports')" icon="⚽" more="/games/sports" />
        <div class="scroll-row hide-scrollbar">
          <ProviderCard v-for="p in sportsProviders" :key="p.id" :provider="p" category="sports" />
          <ComingSoonCard />
        </div>

        <!-- Chess -->
        <SectionHeader :title="t('home.chess')" icon="♟️" more="/games/chess" />
        <div class="scroll-row hide-scrollbar">
          <ProviderCard v-for="p in chessProviders" :key="p.id" :provider="p" category="chess" />
          <ComingSoonCard />
        </div>

        <!-- Video -->
        <SectionHeader :title="t('home.video')" icon="🎬" />
        <div class="scroll-row hide-scrollbar">
          <div class="video-card" @click="$router.push('/video')">
            <div class="video-icon">🔞</div>
            <span>{{ t('video.adult') }}</span>
          </div>
          <div class="video-card" @click="$router.push('/video')">
            <div class="video-icon">🎬</div>
            <span>{{ t('video.movies') }}</span>
          </div>
          <div class="coming-soon-mini">
            <span>🔮</span>
            <span>{{ t('common.comingSoon') }}</span>
          </div>
        </div>

        <!-- Crypto Section -->
        <SectionHeader :title="t('home.crypto')" icon="₿" />
        <div class="crypto-section">
          <a href="https://www.huobi.com" target="_blank" class="crypto-link">
            <span class="crypto-icon">🟡</span>
            <span>Huobi</span>
          </a>
          <a href="https://www.binance.com" target="_blank" class="crypto-link">
            <span class="crypto-icon">🟠</span>
            <span>Binance</span>
          </a>
          <a href="https://www.okx.com" target="_blank" class="crypto-link">
            <span class="crypto-icon">⚫</span>
            <span>OKX</span>
          </a>
          <div class="crypto-link vpn" @click="showVpnTip">
            <span class="crypto-icon">🔒</span>
            <span>{{ t('home.vpnDownload') }}</span>
          </div>
        </div>

        <!-- Partners -->
        <SectionHeader :title="t('home.partners')" icon="🤝" />
        <div class="partners-section">
          <div v-for="i in 6" :key="i" class="partner-logo">
            <img :src="`https://picsum.photos/80/40?random=${70 + i}`" :alt="`Partner ${i}`" />
          </div>
        </div>

        <!-- License -->
        <div class="license-section">
          <div class="license-badges">
            <div class="license-badge">
              <span class="badge-icon">🛡️</span>
              <span class="badge-text">Gaming Curacao</span>
            </div>
            <div class="license-badge">
              <span class="badge-icon">🔞</span>
              <span class="badge-text">18+</span>
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
          <span class="empty-icon">🎮</span>
          <p>{{ t('common.comingSoon') }}</p>
        </div>
      </template>
    </div>
  </van-pull-refresh>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
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
import ComingSoonCard from '@/components/home/ComingSoonCard.vue'

const { t } = useI18n()
const appStore = useAppStore()
const gameStore = useGameStore()

const activeCategory = ref('home')
const refreshing = ref(false)

const hotGames = computed(() => gameStore.hotGames)
const slotsProviders = computed(() => gameStore.getProvidersByCategory('slots'))
const liveProviders = computed(() => gameStore.getProvidersByCategory('live'))
const fishingProviders = computed(() => gameStore.getProvidersByCategory('fishing'))
const lotteryProviders = computed(() => gameStore.getProvidersByCategory('lottery'))
const sportsProviders = computed(() => gameStore.getProvidersByCategory('sports'))
const chessProviders = computed(() => gameStore.getProvidersByCategory('chess'))

const categoryGames = computed(() => gameStore.getGamesByCategory(activeCategory.value))

function onCategoryChange(category) {
  activeCategory.value = category
}

function showVpnTip() {
  showToast({ message: 'VPN Download Link', position: 'bottom' })
}

async function onRefresh() {
  await Promise.all([appStore.initApp(), gameStore.fetchGames()])
  refreshing.value = false
}

onMounted(() => {
  appStore.initApp()
  gameStore.fetchGames()
})
</script>

<style lang="scss" scoped>
.home-page {
  padding-bottom: 20px;
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

.video-card {
  width: 120px;
  height: 100px;
  flex-shrink: 0;
  border-radius: 12px;
  background: $bg-card;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  font-size: 13px;

  .video-icon { font-size: 32px; }
}

.coming-soon-mini {
  width: 120px;
  height: 100px;
  flex-shrink: 0;
  border-radius: 12px;
  background: $bg-card;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px dashed $border-color;
  font-size: 11px;
  color: $text-muted;
}

.crypto-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  padding: 0 12px;
}

.crypto-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 0;
  border-radius: 10px;
  background: $bg-card;
  font-size: 11px;
  color: $text-secondary;
  cursor: pointer;

  &.vpn {
    background: linear-gradient(135deg, rgba($accent-purple, 0.3), rgba($accent-purple, 0.1));
    color: $accent-purple-light;
  }
}

.crypto-icon { font-size: 24px; }

.partners-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 0 12px;
}

.partner-logo {
  height: 50px;
  border-radius: 8px;
  background: $bg-card;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;

  img {
    max-height: 100%;
    opacity: 0.7;
  }
}

.license-section {
  margin: 24px 12px 0;
  text-align: center;
  padding: 20px;
  border-top: 1px solid $border-color;
}

.license-badges {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 12px;
}

.license-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: $text-secondary;

  .badge-icon { font-size: 20px; }
}

.license-text {
  font-size: 11px;
  color: $text-muted;
  line-height: 1.5;
}
</style>
