<template>
  <div class="provider-card" @click="handleClick">
    <div class="card-image">
      <img v-lazy="provider.logo" :alt="provider.name" />
    </div>
    <div class="card-info">
      <span class="provider-name">{{ provider.name }}</span>
      <span class="game-count">{{ provider.gameCount }} {{ t('home.allGames') }}</span>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  provider: { type: Object, required: true },
  category: { type: String, default: '' }
})

const router = useRouter()
const { t } = useI18n()

function handleClick() {
  router.push(`/games/${props.category}?provider=${props.provider.id}`)
}
</script>

<style lang="scss" scoped>
.provider-card {
  width: $provider-card-width;
  height: $provider-card-height;
  flex-shrink: 0;
  border-radius: 12px;
  background: $bg-card;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
  display: flex;
  flex-direction: column;

  &:active {
    transform: scale(0.96);
  }
}

.card-image {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;

  img {
    max-width: 100%;
    max-height: 60px;
    object-fit: contain;
  }
}

.card-info {
  padding: 8px 10px 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.provider-name {
  font-size: 13px;
  font-weight: 600;
}

.game-count {
  font-size: 10px;
  color: $text-muted;
}
</style>
