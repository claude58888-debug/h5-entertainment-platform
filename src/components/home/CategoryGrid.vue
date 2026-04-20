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
      <!-- Decorative oversized 2.5D icon behind content -->
      <div class="cat-icon" aria-hidden="true">
        <!-- Live Casino: Spade with inner highlight -->
        <svg v-if="cat.icon === 'spade'" viewBox="0 0 140 140" fill="none" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="sp-hi" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
              <stop offset="100%" stop-color="#ffffff" stop-opacity="0.05"/>
            </linearGradient>
          </defs>
          <g transform="translate(70 74)">
            <path d="M0 -54 C-18 -30 -46 -12 -46 12 C-46 30 -30 40 -16 36 C-16 46 -22 52 -28 56 L28 56 C22 52 16 46 16 36 C30 40 46 30 46 12 C46 -12 18 -30 0 -54 Z"
                  fill="#ffffff" fill-opacity="0.18"/>
            <path d="M0 -48 C-14 -28 -38 -14 -38 10 C-38 22 -30 28 -22 26" stroke="url(#sp-hi)" stroke-width="3" stroke-linecap="round" fill="none"/>
          </g>
        </svg>

        <!-- Slots: big 7 with glow -->
        <svg v-else-if="cat.icon === 'seven'" viewBox="0 0 140 140" fill="none" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="sv-hi" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="0.5"/>
              <stop offset="100%" stop-color="#ffffff" stop-opacity="0.05"/>
            </linearGradient>
          </defs>
          <g transform="translate(22 22)">
            <path d="M0 8 L96 8 L96 24 L48 96 L28 96 L72 24 L0 24 Z"
                  fill="#ffffff" fill-opacity="0.18"/>
            <path d="M2 10 L94 10 L94 22" stroke="url(#sv-hi)" stroke-width="2" stroke-linecap="round" fill="none"/>
          </g>
          <!-- sparkles -->
          <circle cx="118" cy="26" r="3" fill="#ffffff" fill-opacity="0.35"/>
          <circle cx="28" cy="110" r="2" fill="#ffffff" fill-opacity="0.35"/>
        </svg>

        <!-- Sports: football (soccer ball) with hex pattern -->
        <svg v-else-if="cat.icon === 'football'" viewBox="0 0 140 140" fill="none" preserveAspectRatio="xMidYMid meet">
          <g transform="translate(70 74)">
            <circle r="52" fill="#ffffff" fill-opacity="0.14" stroke="#ffffff" stroke-opacity="0.35" stroke-width="2"/>
            <polygon points="0,-26 22,-10 14,18 -14,18 -22,-10" fill="#ffffff" fill-opacity="0.3"/>
            <line x1="0" y1="-52" x2="0" y2="-26" stroke="#ffffff" stroke-opacity="0.3" stroke-width="2"/>
            <line x1="52" y1="0" x2="22" y2="-10" stroke="#ffffff" stroke-opacity="0.3" stroke-width="2"/>
            <line x1="52" y1="0" x2="14" y2="18" stroke="#ffffff" stroke-opacity="0.3" stroke-width="2"/>
            <line x1="-52" y1="0" x2="-22" y2="-10" stroke="#ffffff" stroke-opacity="0.3" stroke-width="2"/>
            <line x1="-52" y1="0" x2="-14" y2="18" stroke="#ffffff" stroke-opacity="0.3" stroke-width="2"/>
            <line x1="0" y1="52" x2="0" y2="18" stroke="#ffffff" stroke-opacity="0.3" stroke-width="2"/>
            <!-- shine -->
            <path d="M-32 -32 A52 52 0 0 1 10 -50" stroke="#ffffff" stroke-opacity="0.5" stroke-width="3" stroke-linecap="round" fill="none"/>
          </g>
        </svg>

        <!-- Lottery: 88 big with halo -->
        <svg v-else-if="cat.icon === 'lottery'" viewBox="0 0 140 140" fill="none" preserveAspectRatio="xMidYMid meet">
          <circle cx="70" cy="72" r="58" fill="#ffffff" fill-opacity="0.08"/>
          <text x="70" y="98" text-anchor="middle" font-size="84" font-weight="900" fill="#ffffff" fill-opacity="0.22" font-family="Manrope, system-ui, sans-serif">88</text>
          <!-- star sparkles -->
          <g transform="translate(24 32)" fill="#ffffff" fill-opacity="0.45">
            <path d="M0 -6 L2 -2 L6 0 L2 2 L0 6 L-2 2 L-6 0 L-2 -2 Z"/>
          </g>
          <g transform="translate(120 110)" fill="#ffffff" fill-opacity="0.35">
            <path d="M0 -5 L1.5 -1.5 L5 0 L1.5 1.5 L0 5 L-1.5 1.5 L-5 0 L-1.5 -1.5 Z"/>
          </g>
        </svg>

        <!-- Fishing: stylized fish with bubble -->
        <svg v-else-if="cat.icon === 'fish'" viewBox="0 0 140 140" fill="none" preserveAspectRatio="xMidYMid meet">
          <g transform="translate(12 40)">
            <path d="M0 32 C16 8 56 8 80 32 C56 56 16 56 0 32 Z M80 32 L108 12 L102 32 L108 52 Z"
                  fill="#ffffff" fill-opacity="0.18"/>
            <circle cx="28" cy="28" r="3" fill="#ffffff" fill-opacity="0.6"/>
            <path d="M50 20 C52 26 54 38 50 44" stroke="#ffffff" stroke-opacity="0.3" stroke-width="2" fill="none"/>
          </g>
          <!-- bubbles -->
          <circle cx="22" cy="18" r="4" fill="#ffffff" fill-opacity="0.25"/>
          <circle cx="10" cy="32" r="2.5" fill="#ffffff" fill-opacity="0.3"/>
        </svg>

        <!-- Cards (mahjong/cards pair) -->
        <svg v-else-if="cat.icon === 'cards'" viewBox="0 0 140 140" fill="none" preserveAspectRatio="xMidYMid meet">
          <g transform="translate(18 22)">
            <rect x="0" y="10" width="52" height="76" rx="8" transform="rotate(-10 26 48)" fill="#ffffff" fill-opacity="0.22"/>
            <rect x="40" y="4" width="52" height="76" rx="8" transform="rotate(10 66 42)" fill="#ffffff" fill-opacity="0.14"/>
            <!-- pip dots on front card -->
            <g transform="rotate(-10 26 48)" fill="#ffffff" fill-opacity="0.55">
              <circle cx="12" cy="26" r="3"/>
              <circle cx="26" cy="48" r="3"/>
              <circle cx="40" cy="70" r="3"/>
            </g>
          </g>
        </svg>

        <!-- Video: film reel -->
        <svg v-else-if="cat.icon === 'play'" viewBox="0 0 140 140" fill="none" preserveAspectRatio="xMidYMid meet">
          <g transform="translate(70 74)">
            <circle r="50" fill="#ffffff" fill-opacity="0.14"/>
            <circle r="10" fill="#ffffff" fill-opacity="0.4"/>
            <g fill="#ffffff" fill-opacity="0.35">
              <circle cx="0" cy="-30" r="7"/>
              <circle cx="26" cy="-15" r="7"/>
              <circle cx="26" cy="15" r="7"/>
              <circle cx="0" cy="30" r="7"/>
              <circle cx="-26" cy="15" r="7"/>
              <circle cx="-26" cy="-15" r="7"/>
            </g>
            <polygon points="-4,-8 12,0 -4,8" fill="#ffffff" fill-opacity="0.9"/>
          </g>
        </svg>

        <!-- Crash: multiplier arrow -->
        <svg v-else-if="cat.icon === 'crash'" viewBox="0 0 140 140" fill="none" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="cr-hi" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="0.1"/>
              <stop offset="100%" stop-color="#ffffff" stop-opacity="0.55"/>
            </linearGradient>
          </defs>
          <g transform="translate(18 22)">
            <path d="M0 96 L28 66 L44 74 L92 14 L104 14 L104 26 L52 84 L40 78 L12 104 Z"
                  fill="#ffffff" fill-opacity="0.2"/>
            <path d="M0 96 L28 66 L44 74 L92 14" stroke="url(#cr-hi)" stroke-width="3" stroke-linecap="round" fill="none"/>
            <polygon points="104,14 92,14 104,26" fill="#ffffff" fill-opacity="0.45"/>
          </g>
          <!-- x2 label sparkle -->
          <circle cx="26" cy="26" r="3" fill="#ffffff" fill-opacity="0.35"/>
        </svg>
      </div>

      <div class="cat-info">
        <h3 class="cat-name">{{ cat.name }}</h3>
        <p class="cat-subtitle">{{ cat.subtitle }}</p>
        <div class="cat-providers">
          <span v-for="p in cat.providers" :key="p" class="provider-tag">{{ p }}</span>
        </div>
      </div>
    </router-link>
  </div>
</template>

<script setup>
const categories = [
  { key: 'live',    name: '真人视讯', subtitle: '百家乐·龙虎·轮盘', icon: 'spade',    gradient: 'linear-gradient(135deg, #c21b5b 0%, #7a2582 100%)', providers: ['DG', 'EVO', 'BG'],     path: '/games/live' },
  { key: 'slots',   name: '电子',     subtitle: '老虎机·爆奖',       icon: 'seven',    gradient: 'linear-gradient(135deg, #3b5bff 0%, #7a3cff 100%)', providers: ['PG', 'PP', 'CQ9'],     path: '/games/slots' },
  { key: 'sports',  name: '体育',     subtitle: '足球·篮球·电竞',    icon: 'football', gradient: 'linear-gradient(135deg, #15896b 0%, #2fbc6f 100%)', providers: ['IM', 'FB', 'SB'],      path: '/games/sports' },
  { key: 'lottery', name: '彩票',     subtitle: '时时彩·11选5',      icon: 'lottery',  gradient: 'linear-gradient(135deg, #e4892a 0%, #f0c34e 100%)', providers: ['官方', 'VR'],          path: '/games/lottery' },
  { key: 'fishing', name: '捕鱼',     subtitle: '海王·深海猎杀',     icon: 'fish',     gradient: 'linear-gradient(135deg, #0a4474 0%, #0d9ab8 100%)', providers: ['JILI', 'CQ9'],         path: '/games/fishing' },
  { key: 'chess',   name: '棋牌',     subtitle: '德州·麻将·斗地主',  icon: 'cards',    gradient: 'linear-gradient(135deg, #6b3f1c 0%, #c4913b 100%)', providers: ['KY', 'BBIN'],          path: '/games/chess' },
  { key: 'video',   name: '影视',     subtitle: '电影·电视剧·综艺',  icon: 'play',     gradient: 'linear-gradient(135deg, #3a1a6b 0%, #6a2bb8 100%)', providers: ['HBO', 'NF'],           path: '/video' },
  { key: 'crash',   name: '弹珠',     subtitle: 'Crash·倍率爆奖',    icon: 'crash',    gradient: 'linear-gradient(135deg, #0f8a9a 0%, #2dd0d8 100%)', providers: ['Spribe'],              path: '/games/crash' }
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
  min-height: 124px;
  padding: 14px 14px 12px;
  border-radius: $radius-lg;
  overflow: hidden;
  color: #fff;
  text-decoration: none;
  border: 1px solid rgba(255, 255, 255, 0.10);
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.15),
    inset 0 -12px 32px rgba(0, 0, 0, 0.35);
  transition: transform 0.15s ease, box-shadow 0.2s ease;

  // Top-left soft highlight for 2.5D depth
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(160px 120px at 15% 0%, rgba(255, 255, 255, 0.22), transparent 70%),
      linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0.25) 100%);
    pointer-events: none;
    z-index: 1;
  }

  // Bottom-right dark vignette so the icon "sits" in the card
  &::after {
    content: '';
    position: absolute;
    right: 0;
    bottom: 0;
    width: 70%;
    height: 80%;
    background: radial-gradient(circle at 100% 100%, rgba(0,0,0,0.35), transparent 70%);
    pointer-events: none;
    z-index: 1;
  }

  &:active {
    transform: translateY(1px) scale(0.99);
    box-shadow:
      0 3px 14px rgba(0, 0, 0, 0.35),
      inset 0 1px 0 rgba(255, 255, 255, 0.12);
  }
}

.cat-info {
  position: relative;
  z-index: 3;
  max-width: 100%;
}

.cat-name {
  font-size: 19px;
  font-weight: 800;
  letter-spacing: 0.5px;
  line-height: 1.1;
  text-shadow: 0 2px 6px rgba(0,0,0,0.45);
}

.cat-subtitle {
  margin-top: 3px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.82);
  letter-spacing: 0.3px;
  text-shadow: 0 1px 3px rgba(0,0,0,0.35);
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
  padding: 2px 7px;
  border-radius: 99px;
  background: rgba(0, 0, 0, 0.32);
  color: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.24);
  letter-spacing: 0.4px;
  backdrop-filter: blur(4px);
}

// Oversized decorative 2.5D icon
.cat-icon {
  position: absolute;
  right: -18px;
  bottom: -18px;
  width: 130px;
  height: 130px;
  z-index: 2;
  pointer-events: none;
  filter: drop-shadow(0 6px 12px rgba(0,0,0,0.3));

  svg {
    width: 100%;
    height: 100%;
    display: block;
  }
}

// Per-card icon position tweaks
.cat-lottery .cat-icon {
  right: -10px;
  bottom: -14px;
  width: 120px;
  height: 120px;
}

.cat-crash .cat-icon,
.cat-slots .cat-icon {
  right: -14px;
  bottom: -10px;
}
</style>
