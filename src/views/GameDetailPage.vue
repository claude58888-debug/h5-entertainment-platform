<template>
  <div class="game-detail-page">
    <van-nav-bar
      :title="game?.name || ''"
      left-arrow
      @click-left="$router.back()"
      fixed
      class="nav-bar-centered"
    />
    <div class="detail-content" v-if="game">
      <div class="game-cover">
        <img :src="game.image" :alt="game.name" />
      </div>
      <div class="game-info">
        <h2 class="game-name">{{ game.name }}</h2>
        <div class="game-meta">
          <span class="meta-item">{{ t('game.provider') }}: {{ game.provider }}</span>
          <span class="meta-item category-badge">{{ game.category }}</span>
        </div>
      </div>
      <div class="game-actions">
        <van-button type="primary" round block size="large" @click="playGame">
          {{ t('game.play') }}
        </van-button>
        <van-button round block size="large" class="demo-btn" @click="playDemo">
          {{ t('game.demo') }}
        </van-button>
      </div>
      <div class="game-desc">
        <p>Experience the thrill of {{ game.name }} by {{ game.provider }}. Enjoy high-quality graphics and exciting gameplay mechanics.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useGameStore } from '@/stores/game'
import { showToast } from 'vant'
import { launchGameApi, demoGameApi } from '@/api/game'

const { t } = useI18n()
const route = useRoute()
const gameStore = useGameStore()

const game = computed(() => gameStore.getGameById(route.params.id))

async function playGame() {
  if (!game.value) return
  showToast({ message: 'Launching game...', position: 'bottom' })
  try {
    const res = await launchGameApi(route.params.id)
    if (res.success && res.launchUrl) {
      window.open(res.launchUrl, '_blank')
    } else {
      showToast({ message: res.error || 'Launch failed', position: 'bottom' })
    }
  } catch (err) {
    showToast({ message: 'Failed to launch game', position: 'bottom' })
  }
}

async function playDemo() {
  if (!game.value) return
  showToast({ message: 'Loading demo...', position: 'bottom' })
  try {
    const res = await demoGameApi(route.params.id)
    if (res.success && res.launchUrl) {
      window.open(res.launchUrl, '_blank')
    } else {
      showToast({ message: res.error || 'Demo not available', position: 'bottom' })
    }
  } catch (err) {
    showToast({ message: 'Failed to load demo', position: 'bottom' })
  }
}

</script>

<style lang="scss" scoped>
.nav-bar-centered {
  max-width: 480px;
  margin: 0 auto;
}
.detail-content {
  padding-top: 46px;
}
.game-cover {
  width: 100%;
  height: 260px;
  overflow: hidden;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}
.game-info {
  padding: 16px;
}
.game-name {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 8px;
}
.game-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}
.meta-item {
  font-size: 13px;
  color: $text-secondary;
}
.category-badge {
  background: $accent-purple;
  color: #fff;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 11px;
  text-transform: uppercase;
}
.game-actions {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.demo-btn {
  background: $bg-card !important;
  border-color: $border-color !important;
  color: $text-primary !important;
}
.game-desc {
  padding: 0 16px 24px;
  font-size: 14px;
  color: $text-secondary;
  line-height: 1.6;
}
</style>
