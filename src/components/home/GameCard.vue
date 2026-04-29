<template>
  <div class="game-card" @click="handleClick">
    <div class="card-image" :style="{ background: gameGradient }">
      <img v-if="game.image && !imgFailed" :src="game.image" :alt="game.name" class="game-img" @error="onImgError" loading="lazy" />
      <div v-if="!hasImage" class="card-deco">
        <div class="deco-circle c1"></div>
        <div class="deco-circle c2"></div>
        <div class="deco-diamond"></div>
      </div>
      <div v-if="game.is_hot || game.hot" class="hot-badge">HOT</div>
      <div v-if="game.is_new || game.isNew" class="new-badge">NEW</div>
    </div>
    <div class="card-name">{{ game.name }}</div>
    <div v-if="game.category_label" class="card-category">{{ game.category_label }}</div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { addRecentGame } from '@/utils/recentBrowsing'
import { launchSK7755GameApi } from '@/api/game'
import { showToast } from 'vant'

const props = defineProps({
  game: { type: Object, required: true }
})

const router = useRouter()
const userStore = useUserStore()
const imgFailed = ref(false)

const hasImage = computed(() => props.game.image && !imgFailed.value)

// V3: Generate gradient from game name hash
function nameHash(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash)
}

const hueAngles = [
  [280, 320], [200, 260], [340, 20], [160, 200], [40, 80],
  [300, 350], [220, 270], [10, 50], [120, 160], [260, 310]
]

const gameGradient = computed(() => {
  const h = nameHash(props.game.name || 'game')
  const pair = hueAngles[h % hueAngles.length]
  return `linear-gradient(135deg, hsl(${pair[0]}, 60%, 25%), hsl(${pair[1]}, 55%, 18%))`
})

function onImgError(e) {
  e.target.style.display = 'none'
  imgFailed.value = true
}

const dedicatedRoutes = {
  65: '/games/canada-28'
}

async function handleClick() {
  if (!userStore.isLoggedIn) {
    userStore.showLoginModal = true
    return
  }
  addRecentGame(props.game)

  if (props.game.source === 'sk7755' && props.game.platform && props.game.game_code) {
    showToast({ message: '正在启动游戏...', position: 'bottom' })
    try {
      const res = await launchSK7755GameApi(props.game.platform, props.game.game_code)
      if (res.success && res.launchUrl) {
        window.open(res.launchUrl, '_blank')
      } else {
        showToast({ message: res.error || '启动失败', position: 'bottom' })
      }
    } catch (err) {
      showToast({ message: '游戏启动失败', position: 'bottom' })
    }
    return
  }

  const route = dedicatedRoutes[props.game.id]
  if (route) {
    router.push(route)
  } else {
    router.push(`/game/${props.game.id}`)
  }
}
</script>

<style lang="scss" scoped>
.game-card {
  width: 110px;
  flex-shrink: 0;
  cursor: pointer;
  transition: transform 0.2s;

  &:active {
    transform: scale(0.96);
  }
}

.card-image {
  width: 100%;
  height: 140px;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  border: 1px solid var(--color-border, rgba(212, 168, 67, 0.15));
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
  transition: border-color 0.25s, box-shadow 0.25s;

  &:hover {
    border-color: var(--color-border-gold, rgba(212, 168, 67, 0.3));
    box-shadow: 0 6px 25px rgba(212, 168, 67, 0.15);
  }
}

.game-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 2;
}

.card-deco {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.deco-circle {
  position: absolute;
  border-radius: 50%;
  border: 2px solid rgba(212, 168, 67, 0.12);

  &.c1 {
    width: 80px;
    height: 80px;
    right: -20px;
    top: -20px;
  }
  &.c2 {
    width: 50px;
    height: 50px;
    left: -15px;
    bottom: 30px;
    border-color: rgba(212, 168, 67, 0.06);
  }
}

.deco-diamond {
  position: absolute;
  width: 20px;
  height: 20px;
  right: 15px;
  top: 50%;
  transform: rotate(45deg);
  border: 1.5px solid rgba(212, 168, 67, 0.08);
}

.hot-badge {
  position: absolute;
  top: 4px;
  left: 4px;
  background: linear-gradient(90deg, #d4a843, #f3c869);
  color: #1a0a2e;
  font-size: 8px;
  font-weight: 800;
  padding: 1px 5px;
  border-radius: 4px;
  z-index: 3;
  letter-spacing: 0.5px;
}

.new-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  background: linear-gradient(90deg, #10b981, #34d399);
  color: #fff;
  font-size: 8px;
  font-weight: 800;
  padding: 1px 5px;
  border-radius: 4px;
  z-index: 3;
  letter-spacing: 0.5px;
}

.card-name {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.88);
  text-align: center;
  margin-top: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.3;
  font-weight: 500;
}

.card-category {
  font-size: 9px;
  color: var(--color-text-muted, rgba(255, 255, 255, 0.42));
  text-align: center;
  margin-top: 1px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
