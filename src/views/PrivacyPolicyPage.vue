<template>
  <div class="privacy-page">
    <van-nav-bar title="隐私政策" left-arrow @click-left="$router.back()" />

    <div class="page-content">
      <div class="policy-card">
        <h2>隐私政策</h2>
        <p class="updated">最后更新: 2026年3月1日</p>

        <div class="section">
          <h3>1. 信息收集</h3>
          <p>我们收集以下类型的个人信息以提供和改善我们的服务：</p>
          <ul>
            <li>注册信息：用户名、电子邮箱、手机号码</li>
            <li>身份验证信息：身份证件、地址证明（用于KYC验证）</li>
            <li>交易信息：存款、取款、投注记录</li>
            <li>设备信息：IP地址、浏览器类型、设备标识</li>
            <li>使用数据：页面访问、游戏偏好、登录时间</li>
          </ul>
        </div>

        <div class="section">
          <h3>2. 信息使用</h3>
          <p>我们使用收集的信息用于：</p>
          <ul>
            <li>提供和维护平台服务</li>
            <li>处理交易和账户管理</li>
            <li>合规与监管要求（KYC/AML）</li>
            <li>防止欺诈和保障账户安全</li>
            <li>改善用户体验和服务质量</li>
            <li>发送重要通知和促销信息（经用户同意）</li>
          </ul>
        </div>

        <div class="section">
          <h3>3. 信息共享</h3>
          <p>我们不会出售您的个人信息。我们可能在以下情况下共享信息：</p>
          <ul>
            <li>经您明确同意</li>
            <li>遵守法律法规要求</li>
            <li>与受监管的支付处理商合作</li>
            <li>与游戏提供商共享必要的游戏数据</li>
          </ul>
        </div>

        <div class="section">
          <h3>4. 数据安全</h3>
          <p>我们采用行业标准的安全措施保护您的个人信息，包括：</p>
          <ul>
            <li>SSL/TLS加密传输</li>
            <li>数据加密存储</li>
            <li>定期安全审计</li>
            <li>严格的员工访问控制</li>
          </ul>
        </div>

        <div class="section">
          <h3>5. 数据保留</h3>
          <p>我们根据法律要求和业务需要保留您的个人信息。当不再需要时，我们将安全删除或匿名化处理您的数据。账户关闭后，我们将保留交易记录至少5年以满足监管要求。</p>
        </div>

        <div class="section">
          <h3>6. 您的权利</h3>
          <p>您有权：</p>
          <ul>
            <li>访问您的个人信息</li>
            <li>更正不准确的信息</li>
            <li>请求删除您的数据（受法律限制）</li>
            <li>限制或反对数据处理</li>
            <li>数据可携带权</li>
          </ul>
        </div>

        <div class="section">
          <h3>7. Cookie政策</h3>
          <p>我们使用Cookie和类似技术来改善您的浏览体验、分析网站流量和个性化内容。您可以通过浏览器设置管理Cookie偏好。</p>
        </div>

        <div class="section">
          <h3>8. 联系我们</h3>
          <p>如果您对本隐私政策有任何疑问或需要行使您的权利，请通过以下方式联系我们：</p>
          <p>电子邮箱: privacy@h5entertainment.com</p>
          <p>客服: support@h5entertainment.com</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style lang="scss" scoped>
.privacy-page {
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
