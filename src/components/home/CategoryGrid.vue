<template>
  <div class="category-grid">
    <router-link
      v-for="cat in categories"
      :key="cat.key"
      :to="cat.path"
      class="cat-card"
      :class="'cat-' + cat.key"
      :style="{ background: cat.gradient }"
    >
      <div class="cat-info">
        <h3 class="cat-name">{{ cat.name }}</h3>
        <p class="cat-subtitle">{{ cat.subtitle }}</p>
        <div class="cat-providers">
          <span v-for="p in cat.providers" :key="p" class="provider-tag">{{ p }}</span>
        </div>
      </div>
      <div class="cat-icon" aria-hidden="true">
        <!-- decorative oversized icon per category -->
        <svg v-if="cat.icon === 'spade'" viewBox="0 0 48 48" fill="none">
          <path d="M24 4 C18 12 8 18 8 26 C8 32 13 36 18 34 C18 38 16 40 14 41 L34 41 C32 40 30 38 30 34 C35 36 40 32 40 26 C40 18 30 12 24 4 Z"
                fill="currentColor" fill-opacity="0.85"/>
        </svg>
        <svg v-else-if="cat.icon === 'seven'" viewBox="0 0 48 48" fill="none">
          <path d="M10 10 L38 10 L24 42" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.9"/>
        </svg>
        <svg v-else-if="cat.icon === 'football'" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="18" stroke="currentColor" stroke-width="3" fill="currentColor" fill-opacity="0.2"/>
          <polygon points="24,14 31,19 28,28 20,28 17,19" fill="currentColor" fill-opacity="0.85"/>
          <path d="M24 6L24 14M42 24L31 19M42 24L28 28M6 24L17 19M6 24L20 28M24 42L24 28" stroke="currentColor" stroke-width="2" opacity="0.7"/>
        </svg>
        <svg v-else-if="cat.icon === 'lottery'" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="18" fill="currentColor" fill-opacity="0.9"/>
          <text x="24" y="30" text-anchor="middle" font-size="18" font-weight="900" fill="#1a1407">88</text>
        </svg>
        <svg v-else-if="cat.icon === 'fish'" viewBox="0 0 48 48" fill="none">
          <path d="M4 24 C12 14 26 14 34 24 C26 34 12 34 4 24 Z M34 24 L44 18 L40 24 L44 30 Z"
                fill="currentColor" fill-opacity="0.85"/>
          <circle cx="12" cy="22" r="1.5" fill="#1a1407"/>
        </svg>
        <svg v-else-if="cat.icon === 'cards'" viewBox="0 0 48 48" fill="none">
          <rect x="8" y="12" width="20" height="28" rx="3" transform="rotate(-8 18 26)" fill="currentColor" fill-opacity="0.85"/>
          <rect x="22" y="10" width="20" height="28" rx="3" transform="rotate(8 32 24)" fill="currentColor" fill-opacity="0.7"/>
        </svg>
        <svg v-else-if="cat.icon === 'play'" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="18" fill="currentColor" fill-opacity="0.85"/>
          <polygon points="20,16 34,24 20,32" fill="#1a1407"/>
        </svg>
        <svg v-else-if="cat.icon === 'crash'" viewBox="0 0 48 48" fill="none">
          <path d="M6 42 L18 30 L24 34 L42 12" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          <polygon points="42,12 34,12 42,20" fill="currentColor"/>
        </svg>
      </div>
    </router-link>
  </div>
</template>

<script setup>
const categories = [
  { key: 'live',    name: '真人视讯', subtitle: 'Live Casino',   icon: 'spade',    gradient: 'linear-gradient(135deg, #c21b5b 0%, #7a2582 100%)', providers: ['DG', 'EVO', 'BG'],     path: '/games/live' },
  { key: 'slots',   name: '电子',     subtitle: 'Slots',          icon: 'seven',    gradient: 'linear-gradient(135deg, #3b5bff 0%, #7a3cff 100%)', providers: ['PG', 'PP', 'CQ9'],     path: '/games/slots' },
  { key: 'sports',  name: '体育',     subtitle: 'Sports',         icon: 'football', gradient: 'linear-gradient(135deg, #15896b 0%, #2fbc6f 100%)', providers: ['IM', 'FB', 'SB'],      path: '/games/sports' },
  { key: 'lottery', name: '彩票',     subtitle: 'Lottery',        icon: 'lottery',  gradient: 'linear-gradient(135deg, #e4892a 0%, #f0c34e 100%)', providers: ['官方', 'VR'],          path: '/games/lottery' },
  { key: 'fishing', name: '捕鱼',     subtitle: 'Fishing',        icon: 'fish',     gradient: 'linear-gradient(135deg, #0a4474 0%, #0d9ab8 100%)', providers: ['JILI', 'CQ9'],         path: '/games/fishing' },
  { key: 'chess',   name: '棋牌',     subtitle: 'Card Games',     icon: 'cards',    gradient: 'linear-gradient(135deg, #6b3f1c 0%, #c4913b 100%)', providers: ['KY', 'BBIN'],          path: '/games/chess' },
  { key: 'video',   name: '影视',     subtitle: 'Video',          icon: 'play',     gradient: 'linear-gradient(135deg, #3a1a6b 0%, #6a2bb8 100%)', providers: ['HBO', 'NF'],           path: '/video' },
  { key: 'crash',   name: '弹珠',     subtitle: 'Crash',          icon: 'crash',    gradient: 'linear-gradient(135deg, #0f8a9a 0%, #2dd0d8 100%)', providers: ['Spribe'],              path: '/games/crash' }
]
</script>

<style lang="scss" scoped>
.category-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 4px 14px 10px;
}

.cat-card {
  position: relative;
  display: block;
  min-height: 112px;
  padding: 12px 14px;
  border-radius: $radius-lg;
  overflow: hidden;
  color: #fff;
  text-decoration: none;
  border: 1px solid rgba(255, 255, 255, 0.10);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35);
  transition: transform 0.15s ease, box-shadow 0.2s ease;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.25) 100%);
    pointer-events: none;
  }

  &:active {
    transform: translateY(1px) scale(0.99);
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
  }
}

.cat-info {
  position: relative;
  z-index: 2;
  max-width: 75%;
}

.cat-name {
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 0.5px;
  line-height: 1.1;
  text-shadow: 0 2px 6px rgba(0,0,0,0.35);
}

.cat-subtitle {
  margin-top: 2px;
  font-size: 10.5px;
  font-family: $font-mono;
  color: rgba(255, 255, 255, 0.75);
  letter-spacing: 0.8px;
  text-transform: uppercase;
}

.cat-providers {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.provider-tag {
  font-size: 9.5px;
  font-weight: 700;
  font-family: $font-mono;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.28);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.22);
  letter-spacing: 0.4px;
}

.cat-icon {
  position: absolute;
  right: -6px;
  bottom: -6px;
  width: 80px;
  height: 80px;
  color: rgba(255, 255, 255, 0.32);
  z-index: 1;
  pointer-events: none;

  svg { width: 100%; height: 100%; }
}
</style>
