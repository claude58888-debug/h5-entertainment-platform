<template>
  <div class="game-card" @click="handleClick">
    <div class="card-image">
      <img v-lazy="game.image" :alt="game.name" />
      <div class="hot-badge" v-if="game.hot">HOT</div>
    </div>
    <div class="card-info">
      <span class="game-name">{{ game.name }}</span>
      <span class="game-provider">{{ game.provider }}</span>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  game: { type: Object, required: true }
})

const router = useRouter()
const userStore = useUserStore()

function handleClick() {
  if (!userStore.isLoggedIn) {
    userStore.showLoginModal = true
    return
  }
  router.push(`/game/${props.game.id}`)
}
</script>

<style lang="scss" scoped>
.game-card {
  width: $game-card-width;
  flex-shrink: 0;
  cursor: pointer;
  transition: transform 0.2s;

  &:active {
    transform: scale(0.96);
  }
}

.card-image {
  width: $game-card-width;
  height: $game-card-height;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  background: $bg-card;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.hot-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  background: linear-gradient(135deg, #ef4444, #f59e0b);
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
}

.card-info {
  padding: 6px 2px 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.game-name {
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.game-provider {
  font-size: 10px;
  color: $text-muted;
}
</style>
