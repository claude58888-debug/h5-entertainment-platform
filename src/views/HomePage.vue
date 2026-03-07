<template>
  <van-pull-refresh v-model="refreshing" @refresh="onRefresh" pulling-text="下拉刷新" loosing-text="释放刷新" loading-text="刷新中...">
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
        <SectionHeader title="热门" icon="🔥" more="/games/hot" :scrollable="true" @scroll-left="scrollHot(-1)" @scroll-right="scrollHot(1)" />
        <div class="scroll-row hide-scrollbar" ref="hotScrollRef">
          <GameCard v-for="game in hotGames" :key="game.id" :game="game" />
        </div>

        <!-- Slots -->
        <SectionHeader title="电子游戏" icon="🎰" more="/games/slots" :scrollable="true" />
        <div class="scroll-row hide-scrollbar">
          <ProviderCard v-for="p in slotsProviders" :key="p.id" :provider="p" category="slots" />
        </div>

        <!-- Live -->
        <SectionHeader title="真人视讯" icon="🎲" more="/games/live" :scrollable="true" />
        <div class="scroll-row hide-scrollbar">
          <ProviderCard v-for="p in liveProviders" :key="p.id" :provider="p" category="live" />
        </div>

        <!-- Fishing -->
        <SectionHeader title="捕鱼游戏" icon="🐟" more="/games/fishing" :scrollable="true" />
        <div class="scroll-row hide-scrollbar">
          <ProviderCard v-for="p in fishingProviders" :key="p.id" :provider="p" category="fishing" />
        </div>

        <!-- Lottery -->
        <SectionHeader title="彩票" icon="🎱" more="/games/lottery" :scrollable="true" />
        <div class="scroll-row hide-scrollbar">
          <ProviderCard v-for="p in lotteryProviders" :key="p.id" :provider="p" category="lottery" />
        </div>

        <!-- Sports -->
        <SectionHeader title="体育竞猜" icon="⚽" more="/games/sports" :scrollable="true" />
        <div class="scroll-row hide-scrollbar">
          <ProviderCard v-for="p in sportsProviders" :key="p.id" :provider="p" category="sports" />
          <ComingSoonCard />
        </div>

        <!-- Chess -->
        <SectionHeader title="棋牌游戏" icon="♟️" more="/games/chess" :scrollable="true" />
        <div class="scroll-row hide-scrollbar">
          <ProviderCard v-for="p in chessProviders" :key="p.id" :provider="p" category="chess" />
          <ComingSoonCard />
        </div>

        <!-- Video -->
        <SectionHeader title="人人影视" icon="🎬" />
        <div class="scroll-row hide-scrollbar">
          <div class="video-card adult" @click="$router.push('/video')">
            <span class="video-label">成人</span>
          </div>
          <div class="video-card movie" @click="$router.push('/video')">
            <span class="video-label">电影</span>
          </div>
          <div class="video-card coming">
            <span class="video-label">即将推出</span>
          </div>
        </div>

        <!-- Crypto Section -->
        <div class="crypto-header">
          <h3>购买虚拟币</h3>
          <button class="vpn-btn" @click="$router.push('/softwareDownload')">推荐VPN</button>
        </div>
        <div class="crypto-section">
          <a href="https://www.huobi.com" target="_blank" class="crypto-link">
            <div class="crypto-icon huobi">H</div>
            <span>火币网</span>
          </a>
          <a href="https://www.binance.com" target="_blank" class="crypto-link">
            <div class="crypto-icon binance">B</div>
            <span>币安</span>
          </a>
          <a href="https://www.okx.com" target="_blank" class="crypto-link">
            <div class="crypto-icon okx">O</div>
            <span>欧易</span>
          </a>
        </div>

        <!-- Partners -->
        <SectionHeader title="游戏事业" icon="🤝" />
        <div class="partners-section">
          <div class="partner-logo" v-for="name in ['PG', 'PP', 'EVO', 'JILI', 'JDB', 'CQ9']" :key="name">
            <span>{{ name }}</span>
          </div>
        </div>

        <!-- License -->
        <div class="license-section">
          <div class="license-badges">
            <div class="license-badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span class="badge-text">Gaming Curacao</span>
            </div>
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
          <p>即将上线</p>
        </div>
      </template>
    </div>
  </van-pull-refresh>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { useGameStore } from '@/stores/game'

import AppNotice from '@/components/common/AppNotice.vue'
import BannerSwiper from '@/components/home/BannerSwiper.vue'
import QuickActions from '@/components/home/QuickActions.vue'
import GameCategoryTabs from '@/components/home/GameCategoryTabs.vue'
import SectionHeader from '@/components/home/SectionHeader.vue'
import GameCard from '@/components/home/GameCard.vue'
import ProviderCard from '@/components/home/ProviderCard.vue'
import ComingSoonCard from '@/components/home/ComingSoonCard.vue'

const appStore = useAppStore()
const gameStore = useGameStore()

const activeCategory = ref('home')
const refreshing = ref(false)
const hotScrollRef = ref(null)

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

function scrollHot(direction) {
  if (hotScrollRef.value) {
    hotScrollRef.value.scrollBy({ left: direction * 200, behavior: 'smooth' })
  }
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
}

.empty-state {
  text-align: center;
  padding: 60px 0;
  color: $text-muted;

  p { margin-top: 12px; }
}

.video-card {
  width: 140px;
  height: 90px;
  flex-shrink: 0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &.adult {
    background: linear-gradient(135deg, #e84393, #d63031);
  }
  &.movie {
    background: linear-gradient(135deg, #0984e3, #6c5ce7);
  }
  &.coming {
    background: rgba(255,255,255,0.04);
    border: 1px dashed rgba(255,255,255,0.1);
    cursor: default;
  }
}

.video-label {
  font-size: 14px;
  font-weight: 700;
  color: #fff;
}

.crypto-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 12px 8px;

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

.crypto-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  color: #fff;

  &.huobi { background: #1e88e5; }
  &.binance { background: #f0b90b; color: #000; }
  &.okx { background: #555; }
}

.partners-section {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0 12px;
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
  font-size: 11px;
  color: $text-muted;
  font-weight: 600;
}

.license-section {
  margin: 24px 12px 0;
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
