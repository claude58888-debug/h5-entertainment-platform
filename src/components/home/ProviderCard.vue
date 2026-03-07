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
    <img
      v-if="provider.image && provider.id !== 'COMING'"
      :src="provider.image"
      :alt="provider.label"
      class="provider-logo"
      @error="onLogoError"
    />
    <div v-if="provider.name" class="card-overlay">
      <span class="provider-name">{{ provider.name }}</span>
    </div>
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
  const card = e.target.closest('.provider-card')
  if (card) {
    e.target.style.display = 'none'
    card.style.background = props.provider.gradient
  }
}

function onLogoError(e) {
  e.target.style.display = 'none'
}

function handleClick() {
  if (props.provider.id === 'COMING') return
  router.push(`/games/${props.category}?provider=${props.provider.id}`)
}
</script>

<style lang="scss" scoped>
.provider-card {
  width: 160px;
  height: 90px;
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
}

.card-bg-gradient {
  width: 100%;
  height: 100%;
}

.provider-logo {
  position: absolute;
  top: 8px;
  left: 8px;
  height: 20px;
  width: auto;
  object-fit: contain;
  z-index: 2;
  filter: brightness(0) invert(1);
  opacity: 0.9;
}

.card-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, transparent 100%);
  padding: 20px 12px 8px;
  z-index: 2;
}

.provider-name {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}
</style>
