<template>
  <div class="provider-card" @click="handleClick">
    <img
      v-if="provider.backgroundImage && provider.id !== 'COMING'"
      :src="provider.backgroundImage"
      :alt="provider.name"
      class="card-bg-img"
      @error="onBgError"
    />
    <div v-if="!provider.backgroundImage || provider.id === 'COMING'" class="card-bg-gradient" :style="{ background: comingGradient || provider.gradient }">
      <span v-if="provider.id === 'COMING'" class="coming-text">即将推出</span>
    </div>
    <img
      v-if="provider.image && provider.id !== 'COMING'"
      :src="provider.image"
      alt=""
      class="provider-logo"
      @error="onLogoError"
    />
    <div v-if="provider.name && provider.id !== 'COMING'" class="card-overlay">
      <span class="provider-name">{{ provider.name }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  provider: { type: Object, required: true },
  category: { type: String, default: '' },
  showCount: { type: Boolean, default: false }
})

const comingGradient = computed(() => {
  if (props.provider.id === 'COMING') return 'linear-gradient(135deg, #2d3436, #636e72)'
  return null
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
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

.coming-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 2px;
  white-space: nowrap;
}

.card-bg-gradient {
  position: relative;
}
</style>
