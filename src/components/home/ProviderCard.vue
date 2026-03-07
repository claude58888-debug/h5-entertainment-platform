<template>
  <div class="provider-card" :style="{ background: provider.gradient }" @click="handleClick">
    <div class="card-content">
      <span class="provider-name">{{ provider.name }}</span>
      <span class="provider-label">{{ provider.label }}</span>
    </div>
    <div class="card-deco">
      <svg width="60" height="60" viewBox="0 0 60 60" fill="none" opacity="0.15">
        <circle cx="30" cy="30" r="25" stroke="white" stroke-width="2"/>
        <circle cx="30" cy="30" r="15" stroke="white" stroke-width="2"/>
      </svg>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  provider: { type: Object, required: true },
  category: { type: String, default: '' }
})

const router = useRouter()

function handleClick() {
  router.push(`/games/${props.category}?provider=${props.provider.id}`)
}
</script>

<style lang="scss" scoped>
.provider-card {
  width: 140px;
  height: 90px;
  flex-shrink: 0;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
  position: relative;
  display: flex;
  align-items: flex-end;

  &:active {
    transform: scale(0.96);
  }
}

.card-content {
  padding: 12px;
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.provider-name {
  font-size: 14px;
  font-weight: 700;
  color: #fff;
}

.provider-label {
  font-size: 9px;
  color: rgba(255,255,255,0.6);
  text-transform: uppercase;
}

.card-deco {
  position: absolute;
  right: -5px;
  top: -5px;
  z-index: 1;
}
</style>
