<template>
  <div class="responsible-gaming-page">
    <van-nav-bar title="负责任博彩" left-arrow @click-left="$router.back()" />

    <div class="page-content">
      <div class="hero-section">
        <div class="hero-icon">🛡️</div>
        <h2>负责任博彩</h2>
        <p>我们致力于为您提供安全、健康的娱乐体验</p>
      </div>

      <div class="info-card">
        <h3>什么是负责任博彩？</h3>
        <p>负责任博彩意味着将游戏视为娱乐活动，而非赚钱方式。设定预算、控制时间，并在需要时寻求帮助。</p>
      </div>

      <div class="tools-section">
        <h3>我们提供的工具</h3>

        <div class="tool-card" @click="$router.push('/limits')">
          <span class="tool-icon">💰</span>
          <div class="tool-info">
            <h4>存款/投注限额</h4>
            <p>设置每日、每周或每月的存款和投注限额</p>
          </div>
          <span class="arrow">→</span>
        </div>

        <div class="tool-card" @click="$router.push('/self-exclusion')">
          <span class="tool-icon">🚫</span>
          <div class="tool-info">
            <h4>自我排除</h4>
            <p>暂时或永久停止您的游戏活动</p>
          </div>
          <span class="arrow">→</span>
        </div>
      </div>

      <div class="tips-section">
        <h3>安全游戏提示</h3>
        <div class="tip-list">
          <div class="tip-item" v-for="tip in tips" :key="tip.id">
            <span class="tip-number">{{ tip.id }}</span>
            <p>{{ tip.text }}</p>
          </div>
        </div>
      </div>

      <div class="warning-signs">
        <h3>问题赌博的警告信号</h3>
        <ul>
          <li>花费超过您负担得起的金额</li>
          <li>借钱进行游戏</li>
          <li>游戏时间影响工作或家庭</li>
          <li>试图通过继续游戏来弥补损失</li>
          <li>对游戏活动产生焦虑或压力</li>
          <li>隐瞒游戏行为</li>
        </ul>
      </div>

      <div class="help-section">
        <h3>需要帮助？</h3>
        <p>如果您或您认识的人可能有赌博问题，请联系以下机构获取帮助：</p>
        <div class="help-contacts">
          <div class="help-item">
            <span class="help-icon">📞</span>
            <div>
              <strong>全国问题赌博热线</strong>
              <p>1-800-522-4700</p>
            </div>
          </div>
          <div class="help-item">
            <span class="help-icon">💬</span>
            <div>
              <strong>在线客服</strong>
              <p>support@h5entertainment.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const tips = [
  { id: 1, text: '设定预算并坚持执行，不要超出您能承受的范围' },
  { id: 2, text: '将游戏视为娱乐，而非赚钱方式' },
  { id: 3, text: '设定时间限制，定期休息' },
  { id: 4, text: '不要在情绪低落或压力大时进行游戏' },
  { id: 5, text: '不要追逐损失，接受输赢是游戏的一部分' },
  { id: 6, text: '利用平台提供的限额和自我排除工具' }
]
</script>

<style lang="scss" scoped>
.responsible-gaming-page {
  min-height: 100vh;
  background: $bg-primary;
}

.page-content {
  padding: 16px;
}

.hero-section {
  text-align: center;
  padding: 28px 16px;
  margin-bottom: 16px;

  .hero-icon { font-size: 48px; margin-bottom: 10px; }
  h2 { font-size: 20px; margin-bottom: 6px; }
  p { font-size: 13px; color: $text-secondary; }
}

.info-card {
  background: $bg-card;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;

  h3 { font-size: 15px; font-weight: 600; margin-bottom: 8px; }
  p { font-size: 13px; color: $text-secondary; line-height: 1.6; }
}

.tools-section {
  margin-bottom: 16px;

  h3 { font-size: 15px; font-weight: 600; margin-bottom: 12px; }
}

.tool-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: $bg-card;
  padding: 14px;
  border-radius: 10px;
  margin-bottom: 8px;
  cursor: pointer;

  &:active { opacity: 0.8; }

  .tool-icon { font-size: 28px; }
  .tool-info {
    flex: 1;
    h4 { font-size: 14px; margin-bottom: 2px; }
    p { font-size: 12px; color: $text-muted; }
  }
  .arrow { color: $text-muted; font-size: 16px; }
}

.tips-section {
  margin-bottom: 16px;

  h3 { font-size: 15px; font-weight: 600; margin-bottom: 12px; }
}

.tip-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: $bg-card;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 6px;

  .tip-number {
    background: linear-gradient(135deg, #e6a23c, #f0c040);
    color: #000;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    flex-shrink: 0;
  }

  p { font-size: 13px; color: $text-secondary; line-height: 1.5; }
}

.warning-signs {
  background: rgba(245, 108, 108, 0.1);
  border: 1px solid rgba(245, 108, 108, 0.2);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;

  h3 { font-size: 15px; font-weight: 600; margin-bottom: 10px; color: #f56c6c; }

  ul {
    padding-left: 18px;
    li {
      font-size: 13px;
      color: $text-secondary;
      line-height: 1.8;
    }
  }
}

.help-section {
  background: $bg-card;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;

  h3 { font-size: 15px; font-weight: 600; margin-bottom: 8px; }
  > p { font-size: 13px; color: $text-secondary; margin-bottom: 12px; }
}

.help-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

  &:last-child { border-bottom: none; }

  .help-icon { font-size: 24px; }
  strong { font-size: 14px; display: block; margin-bottom: 2px; }
  p { font-size: 12px; color: $text-muted; }
}
</style>
