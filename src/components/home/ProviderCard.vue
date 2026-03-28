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
  if (props.provider.link) {
    router.push(props.provider.link)
  } else {
    router.push(`/games/${props.category}?provider=${props.provider.id}`)
  }
}
</script>

<style lang="scss" scoped>
.provider-card {
  width: 140px;
  height: 130px;
  flex-shrink: 0;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
  position: relative;
  border: 1px solid rgba(124, 58, 237, 0.2);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);

  &:hover {
    border-color: rgba(167, 139, 250, 0.5);
    box-shadow: 0 6px 25px rgba(124, 58, 237, 0.3);
  }

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
  height: 28px;
  width: auto;
  object-fit: contain;
  z-index: 2;
  filter: brightness(0) invert(1);
  opacity: 0.9;
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
