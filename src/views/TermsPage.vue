<template>
  <div class="terms-page">
    <van-nav-bar title="服务条款" left-arrow @click-left="$router.back()" />

    <div class="page-content">
      <div class="policy-card">
        <h2>服务条款</h2>
        <p class="updated">最后更新: 2026年3月1日</p>

        <div class="section">
          <h3>1. 接受条款</h3>
          <p>通过访问和使用本平台，您同意受本服务条款的约束。如果您不同意这些条款，请不要使用本平台。我们保留随时修改这些条款的权利。</p>
        </div>

        <div class="section">
          <h3>2. 资格要求</h3>
          <ul>
            <li>您必须年满18周岁（或您所在司法管辖区的法定年龄）</li>
            <li>您必须具有完全民事行为能力</li>
            <li>您不得位于禁止在线娱乐活动的司法管辖区</li>
            <li>您必须提供真实、准确的个人信息</li>
          </ul>
        </div>

        <div class="section">
          <h3>3. 账户规则</h3>
          <ul>
            <li>每人仅限注册一个账户</li>
            <li>您有责任保护账户安全和密码机密性</li>
            <li>禁止共享、转让或出售账户</li>
            <li>我们保留在发现违规行为时暂停或终止账户的权利</li>
          </ul>
        </div>

        <div class="section">
          <h3>4. 存款与取款</h3>
          <ul>
            <li>所有存款和取款均受平台规定的最低和最高限额约束</li>
            <li>取款可能需要身份验证（KYC）</li>
            <li>处理时间可能因支付方式不同而异</li>
            <li>平台保留对可疑交易进行审查的权利</li>
          </ul>
        </div>

        <div class="section">
          <h3>5. 游戏规则</h3>
          <p>每个游戏都有其特定的规则和赔率。玩家有责任在参与前了解游戏规则。所有游戏结果由认证的随机数生成器（RNG）决定，确保公平性。</p>
        </div>

        <div class="section">
          <h3>6. 奖金与促销</h3>
          <ul>
            <li>所有奖金和促销活动均受特定条款和条件约束</li>
            <li>奖金可能需要满足投注要求才能提现</li>
            <li>平台保留修改或取消促销活动的权利</li>
            <li>滥用促销活动可能导致账户限制</li>
          </ul>
        </div>

        <div class="section">
          <h3>7. 负责任博彩</h3>
          <p>我们致力于推广负责任博彩。我们提供以下工具帮助您控制游戏行为：</p>
          <ul>
            <li>存款限额设置</li>
            <li>投注限额设置</li>
            <li>自我排除选项</li>
            <li>冷却期功能</li>
          </ul>
        </div>

        <div class="section">
          <h3>8. 知识产权</h3>
          <p>本平台上的所有内容，包括但不限于文字、图形、标志、图像和软件，均为平台或其许可方的财产，受知识产权法保护。</p>
        </div>

        <div class="section">
          <h3>9. 免责声明</h3>
          <p>本平台按"现状"提供服务。我们不保证服务不会中断或无错误。在法律允许的最大范围内，我们不对任何间接、偶然或后果性损害承担责任。</p>
        </div>

        <div class="section">
          <h3>10. 联系方式</h3>
          <p>如果您对本服务条款有任何疑问，请联系我们：</p>
          <p>电子邮箱: legal@h5entertainment.com</p>
          <p>客服: support@h5entertainment.com</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style lang="scss" scoped>
.terms-page {
  min-height: 100vh;
  background: $bg-primary;
}

.page-content {
  padding: 16px;
}

.policy-card {
  background: $bg-card;
  border-radius: 12px;
  padding: 20px;

  h2 {
    font-size: 20px;
    margin-bottom: 4px;
  }

  .updated {
    font-size: 12px;
    color: $text-muted;
    margin-bottom: 20px;
  }
}

.section {
  margin-bottom: 20px;

  h3 {
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 8px;
    color: #e6a23c;
  }

  p {
    font-size: 13px;
    color: $text-secondary;
    line-height: 1.7;
    margin-bottom: 6px;
  }

  ul {
    padding-left: 20px;
    margin: 8px 0;

    li {
      font-size: 13px;
      color: $text-secondary;
      line-height: 1.8;
    }
  }
}
</style>
