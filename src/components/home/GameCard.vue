<template>
  <div class="game-card" @click="handleClick">
    <div class="card-image" :style="{ background: gameGradient }">
      <img v-if="game.image && !imgFailed" :src="game.image" :alt="game.name" class="game-img" @error="onImgError" loading="lazy" />
    </div>
    <div class="game-name">{{ game.name }}</div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { addRecentGame } from '@/utils/recentBrowsing'

const props = defineProps({
  game: { type: Object, required: true }
})

const router = useRouter()
const userStore = useUserStore()
const imgFailed = ref(false)

// Neutral dark surface for missing-image placeholders (Stake-style)
const gameGradient = computed(() => {
  return 'linear-gradient(180deg, #2f4553 0%, #1a2c38 100%)'
})

function onImgError(e) {
  e.target.style.display = 'none'
  imgFailed.value = true
}

// Games with dedicated pages
const dedicatedRoutes = {
  65: '/games/canada-28'
}

function handleClick() {
  if (!userStore.isLoggedIn) {
    userStore.showLoginModal = true
    return
  }
  addRecentGame(props.game)
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
  transition: transform 0.15s ease;

  &:active {
    transform: scale(0.97);
  }
}

.card-image {
  width: 100%;
  height: 140px;
  border-radius: $radius-md;
  overflow: hidden;
  position: relative;
  border: 1px solid $border-subtle;
  transition: border-color 0.2s ease, transform 0.15s ease;

  &:hover {
    border-color: rgba(212, 168, 67, 0.35);
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

.game-name {
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.3;
  color: $text-primary;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
