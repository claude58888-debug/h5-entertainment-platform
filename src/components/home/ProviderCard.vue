<template>
  <div class="provider-card" @click="handleClick">
    <img
      v-if="provider.backgroundImage"
      :src="provider.backgroundImage"
      :alt="provider.name"
      class="card-bg-img"
      @error="onBgError"
    />
    <div v-else class="card-bg-gradient" :style="{ background: provider.gradient }"></div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  provider: { type: Object, required: true },
  category: { type: String, default: '' },
  showCount: { type: Boolean, default: false }
})

const router = useRouter()

function onBgError(e) {
  const card = e.target.parentElement
  if (card) {
    e.target.style.display = 'none'
    card.style.background = props.provider.gradient
  }
}

function handleClick() {
  if (props.provider.id === 'COMING') return
  router.push(`/games/${props.category}?provider=${props.provider.id}`)
}
</script>

<style lang="scss" scoped>
.provider-card {
  width: 160px;
  height: 100px;
  flex-shrink: 0;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
  position: relative;

  &:active {
    transform: scale(0.96);
  }
}

.card-bg-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: 12px;
}

.card-bg-gradient {
  width: 100%;
  height: 100%;
  border-radius: 12px;
}
</style>
