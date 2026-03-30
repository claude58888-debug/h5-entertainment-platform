<template>
  <div class="terms-page">
    <van-nav-bar :title="$t('terms.title')" left-arrow @click-left="$router.back()" />

    <div class="page-content">
      <div class="policy-card">
        <h2>{{ $t('terms.title') }}</h2>
        <p class="updated">{{ $t('terms.lastUpdated') }}</p>

        <div class="section">
          <h3>{{ $t('terms.section1Title') }}</h3>
          <p>{{ $t('terms.section1Desc') }}</p>
        </div>

        <div class="section">
          <h3>{{ $t('terms.section2Title') }}</h3>
          <ul>
            <li>{{ $t('terms.section2Item1') }}</li>
            <li>{{ $t('terms.section2Item2') }}</li>
            <li>{{ $t('terms.section2Item3') }}</li>
            <li>{{ $t('terms.section2Item4') }}</li>
          </ul>
        </div>

        <div class="section">
          <h3>{{ $t('terms.section3Title') }}</h3>
          <ul>
            <li>{{ $t('terms.section3Item1') }}</li>
            <li>{{ $t('terms.section3Item2') }}</li>
            <li>{{ $t('terms.section3Item3') }}</li>
            <li>{{ $t('terms.section3Item4') }}</li>
          </ul>
        </div>

        <div class="section">
          <h3>{{ $t('terms.section4Title') }}</h3>
          <ul>
            <li>{{ $t('terms.section4Item1') }}</li>
            <li>{{ $t('terms.section4Item2') }}</li>
            <li>{{ $t('terms.section4Item3') }}</li>
            <li>{{ $t('terms.section4Item4') }}</li>
          </ul>
        </div>

        <div class="section">
          <h3>{{ $t('terms.section5Title') }}</h3>
          <p>{{ $t('terms.section5Desc') }}</p>
        </div>

        <div class="section">
          <h3>{{ $t('terms.section6Title') }}</h3>
          <ul>
            <li>{{ $t('terms.section6Item1') }}</li>
            <li>{{ $t('terms.section6Item2') }}</li>
            <li>{{ $t('terms.section6Item3') }}</li>
            <li>{{ $t('terms.section6Item4') }}</li>
          </ul>
        </div>

        <div class="section">
          <h3>{{ $t('terms.section7Title') }}</h3>
          <p>{{ $t('terms.section7Desc') }}</p>
          <ul>
            <li>{{ $t('terms.section7Item1') }}</li>
            <li>{{ $t('terms.section7Item2') }}</li>
            <li>{{ $t('terms.section7Item3') }}</li>
            <li>{{ $t('terms.section7Item4') }}</li>
          </ul>
        </div>

        <div class="section">
          <h3>{{ $t('terms.section8Title') }}</h3>
          <p>{{ $t('terms.section8Desc') }}</p>
        </div>

        <div class="section">
          <h3>{{ $t('terms.section9Title') }}</h3>
          <p>{{ $t('terms.section9Desc') }}</p>
        </div>

        <div class="section">
          <h3>{{ $t('terms.section10Title') }}</h3>
          <p>{{ $t('terms.section10Desc') }}</p>
          <p>{{ $t('terms.email') }}</p>
          <p>{{ $t('terms.support') }}</p>
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
