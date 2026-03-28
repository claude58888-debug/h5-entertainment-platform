<template>
  <div class="game-card" @click="handleClick">
    <div class="card-image" :style="{ background: gameGradient }">
      <img v-if="game.image && !imgFailed" :src="game.image" :alt="game.name" class="game-img" @error="onImgError" />
      <div v-if="!hasImage" class="card-deco">
        <div class="deco-circle c1"></div>
        <div class="deco-circle c2"></div>
        <div class="deco-diamond"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  game: { type: Object, required: true }
})

const router = useRouter()
const userStore = useUserStore()
const imgFailed = ref(false)

const hasImage = computed(() => props.game.image && !imgFailed.value)

const gradientMap = {
  '极速糖果1000': 'linear-gradient(135deg, #6c5ce7, #e84393)',
  '麻将胡了2': 'linear-gradient(135deg, #d63031, #f0c040)',
  '麻将胡了': 'linear-gradient(135deg, #00b894, #f0c040)',
  '奥林匹斯之门': 'linear-gradient(135deg, #0984e3, #6c5ce7)',
  '甜入蜜境': 'linear-gradient(135deg, #e84393, #f39c12)',
  '招财猫': 'linear-gradient(135deg, #f0c040, #d63031)',
  '幸运尼柯': 'linear-gradient(135deg, #00b894, #0984e3)',
  '淘金热': 'linear-gradient(135deg, #e67e22, #6d4c41)',
  '宝石糖果': 'linear-gradient(135deg, #e84393, #a855f7)',
  '闪电轮盘': 'linear-gradient(135deg, #f39c12, #e74c3c)',
  '疯狂时间': 'linear-gradient(135deg, #6c5ce7, #00b894)',
  '百家乐': 'linear-gradient(135deg, #b71c1c, #880e4f)',
  '龙虎斗': 'linear-gradient(135deg, #e65100, #f57f17)',
  '海洋之王': 'linear-gradient(135deg, #0277bd, #00acc1)',
  '欢乐捕鱼': 'linear-gradient(135deg, #00695c, #4caf50)',
  '捕鱼大战': 'linear-gradient(135deg, #01579b, #0288d1)',
  '加拿大4.2-4.6': 'linear-gradient(135deg, #4a148c, #7b1fa2)',
  '极速彩票': 'linear-gradient(135deg, #c62828, #e53935)',
  'CR皇冠体育': 'linear-gradient(135deg, #b71c1c, #ff6f00)',
  'IM体育': 'linear-gradient(135deg, #1565c0, #42a5f5)',
  '德州扑克': 'linear-gradient(135deg, #2e7d32, #66bb6a)',
  '中国象棋': 'linear-gradient(135deg, #6d4c41, #a1887f)',
  '成人': 'linear-gradient(135deg, #e84393, #d63031)',
  '电影': 'linear-gradient(135deg, #0984e3, #6c5ce7)',
}

const gameGradient = computed(() => {
  return gradientMap[props.game.name] || 'linear-gradient(135deg, #2d3436, #636e72)'
})

function onImgError(e) {
  e.target.style.display = 'none'
  imgFailed.value = true
}

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
  border: 2px solid rgba(255,255,255,0.12);

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
    border-color: rgba(255,255,255,0.08);
  }
}

.deco-diamond {
  position: absolute;
  width: 20px;
  height: 20px;
  right: 15px;
  top: 50%;
  transform: rotate(45deg);
  border: 1.5px solid rgba(255,255,255,0.1);
}


</style>
