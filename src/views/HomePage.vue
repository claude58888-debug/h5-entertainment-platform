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
        <van-empty class="error-empty" image="network" :description="$t('common.networkError')">
          <van-button type="primary" round size="small" @click="retryLoad">{{ $t('common.reload') }}</van-button>
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
          <!-- Recent Browsing -->
        <template v-if="recentGames.length > 0">
          <SectionHeader :title="$t('home.recent')" icon="🕒" />
          <div class="scroll-row hide-scrollbar">
            <GameCard v-for="game in recentGames" :key="'recent-'+game.id" :game="game" />
          </div>
        </template>

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

        <!-- Purchase Virtual Currency Section -->
        <div class="crypto-section-wrapper">
          <div class="crypto-header">
            <h3>{{ $t('home.buyCrypto') }}</h3>
            <button class="vpn-btn" @click="$router.push('/softwareDownload')">{{ $t('home.recommendVPN') }}</button>
          </div>
          <div class="crypto-section">
            <a href="https://www.huobi.com" target="_blank" class="crypto-link">
              <img src="/img/crypto/huobi.svg" alt="HTX" class="crypto-img" />
              <span class="crypto-name">{{ $t('home.huobi') }}</span>
              <span class="crypto-desc">HTX</span>
            </a>
            <a href="https://www.binance.com" target="_blank" class="crypto-link">
              <img src="/img/crypto/binance.svg" alt="BINANCE" class="crypto-img" />
              <span class="crypto-name">{{ $t('home.binance') }}</span>
              <span class="crypto-desc">Binance</span>
            </a>
            <a href="https://www.okx.com" target="_blank" class="crypto-link">
              <img src="/img/crypto/okex.svg" alt="OKEX" class="crypto-img" />
              <span class="crypto-name">{{ $t('home.okx') }}</span>
              <span class="crypto-desc">OKX</span>
            </a>
          </div>
          <div class="crypto-tip">
            <span>{{ $t('home.cryptoTip') }}</span>
          </div>
          <div class="vpn-recommend" @click="$router.push('/softwareDownload')">
            <div class="vpn-recommend-left">
              <span class="vpn-icon">🔒</span>
              <div>
                <span class="vpn-title">{{ $t('home.vpnTitle') }}</span>
                <span class="vpn-desc">{{ $t('home.vpnDesc') }}</span>
              </div>
            </div>
            <span class="vpn-arrow">›</span>
          </div>
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

        <!-- Footer -->
        <footer class="site-footer">
          <p class="footer-copyright">&copy; {{ new Date().getFullYear() }} H5 Entertainment. All rights reserved.</p>
          <div class="footer-links">
            <router-link to="/terms">Terms</router-link>
            <span class="footer-divider">|</span>
            <router-link to="/privacy">Privacy</router-link>
            <span class="footer-divider">|</span>
            <router-link to="/responsible-gaming">Responsible Gaming</router-link>
          </div>
        </footer>
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

    <!-- Scroll to Top Button -->
    <transition name="fade">
      <div v-show="showScrollTop" class="scroll-top-btn" @click="scrollToTop">
        <span>TOP</span>
      </div>
    </transition>
  </van-pull-refresh>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores/app'
import { useGameStore } from '@/stores/game'
import { showToast } from 'vant'
import { getRecentGames } from '@/utils/recentBrowsing'

import AppNotice from '@/components/common/AppNotice.vue'
import BannerSwiper from '@/components/home/BannerSwiper.vue'
import QuickActions from '@/components/home/QuickActions.vue'
import GameCategoryTabs from '@/components/home/GameCategoryTabs.vue'
import SectionHeader from '@/components/home/SectionHeader.vue'
import GameCard from '@/components/home/GameCard.vue'
import ProviderCard from '@/components/home/ProviderCard.vue'

const { t } = useI18n()
const appStore = useAppStore()
const gameStore = useGameStore()

const activeCategory = ref('home')
const refreshing = ref(false)
const hotScrollRef = ref(null)
const hasError = ref(false)

const pageLoading = computed(() => appStore.loading || gameStore.loading)
const hasData = computed(() => gameStore.games.length > 0)

const recentGames = ref([])
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
    showToast({ message: t('common.loadFailed'), position: 'bottom' })
  }
}

async function onRefresh() {
  hasError.value = false
  try {
    await Promise.all([appStore.initApp(), gameStore.fetchGames()])
  } catch (e) {
    showToast({ message: t('common.refreshFailed'), position: 'bottom' })
  }
  refreshing.value = false
}

function retryLoad() {
  loadData()
}

const showScrollTop = ref(false)

function handleScroll() {
  showScrollTop.value = window.scrollY > 400
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function refreshRecentGames() {
  recentGames.value = getRecentGames()
}

onMounted(() => {
  loadData()
  refreshRecentGames()
  window.addEventListener('scroll', handleScroll)
  window.addEventListener('focus', refreshRecentGames)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('focus', refreshRecentGames)
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


.crypto-section-wrapper {
  padding: 0 12px;
}

.crypto-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 0 12px;

  h3 {
    font-size: 15px;
    font-weight: 700;
  }
}

.vpn-btn {
  padding: 4px 12px;
  border-radius: 14px;
  background: linear-gradient(135deg, $accent-gold, $accent-gold-light);
  color: #1a0a2e;
  font-weight: 600;
  border: none;
  font-size: 11px;
  cursor: pointer;
}

.crypto-section {
  display: flex;
  justify-content: space-around;
  gap: 12px;
}

.crypto-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: 1;
  padding: 16px 0;
  border-radius: 12px;
  background: rgba(255,255,255,0.04);
  font-size: 12px;
  color: $text-secondary;
  transition: background 0.2s;

  &:active {
    background: rgba(255,255,255,0.08);
  }
}

.crypto-img {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.crypto-name {
  font-size: 13px;
  font-weight: 600;
  color: $text-primary;
}

.crypto-desc {
  font-size: 10px;
  color: $text-muted;
}

.crypto-tip {
  text-align: center;
  padding: 10px 0;
  font-size: 11px;
  color: $text-muted;
}

.vpn-recommend {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, rgba(212, 168, 67, 0.08), rgba(243, 200, 105, 0.06));
  border: 1px solid rgba(212, 168, 67, 0.15);
  border-radius: 12px;
  padding: 12px 16px;
  margin-top: 4px;
  cursor: pointer;
  transition: opacity 0.2s;

  &:active {
    opacity: 0.8;
  }
}

.vpn-recommend-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.vpn-icon {
  font-size: 20px;
}

.vpn-title {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: $text-primary;
}

.vpn-desc {
  display: block;
  font-size: 11px;
  color: $text-muted;
  margin-top: 2px;
}

.vpn-arrow {
  font-size: 20px;
  color: rgba(255,255,255,0.3);
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

/* Footer */
.site-footer {
  text-align: center;
  padding: 16px 12px 24px;
  margin-top: 8px;
}

.footer-copyright {
  font-size: 10px;
  color: $text-muted;
  margin-bottom: 8px;
}

.footer-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 10px;

  a {
    color: $text-muted;
    transition: color 0.2s;

    &:active {
      color: $text-secondary;
    }
  }
}

.footer-divider {
  color: rgba(255, 255, 255, 0.15);
  font-size: 10px;
}

/* Scroll to Top */
.scroll-top-btn {
  position: fixed;
  bottom: 80px;
  right: 16px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, $accent-gold, $accent-gold-light);
  color: #1a0a2e;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(212, 168, 67, 0.4);
  z-index: 100;
  transition: transform 0.2s, opacity 0.2s;

  &:active {
    transform: scale(0.9);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
