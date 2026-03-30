<template>
  <div class="privacy-page">
    <van-nav-bar :title="$t('privacy.title')" left-arrow @click-left="$router.back()" />

    <div class="page-content">
      <div class="policy-card">
        <h2>{{ $t('privacy.title') }}</h2>
        <p class="updated">{{ $t('privacy.lastUpdated') }}</p>

        <div class="section">
          <h3>{{ $t('privacy.section1Title') }}</h3>
          <p>{{ $t('privacy.section1Desc') }}</p>
          <ul>
            <li>{{ $t('privacy.section1Item1') }}</li>
            <li>{{ $t('privacy.section1Item2') }}</li>
            <li>{{ $t('privacy.section1Item3') }}</li>
            <li>{{ $t('privacy.section1Item4') }}</li>
            <li>{{ $t('privacy.section1Item5') }}</li>
          </ul>
        </div>

        <div class="section">
          <h3>{{ $t('privacy.section2Title') }}</h3>
          <p>{{ $t('privacy.section2Desc') }}</p>
          <ul>
            <li>{{ $t('privacy.section2Item1') }}</li>
            <li>{{ $t('privacy.section2Item2') }}</li>
            <li>{{ $t('privacy.section2Item3') }}</li>
            <li>{{ $t('privacy.section2Item4') }}</li>
            <li>{{ $t('privacy.section2Item5') }}</li>
            <li>{{ $t('privacy.section2Item6') }}</li>
          </ul>
        </div>

        <div class="section">
          <h3>{{ $t('privacy.section3Title') }}</h3>
          <p>{{ $t('privacy.section3Desc') }}</p>
          <ul>
            <li>{{ $t('privacy.section3Item1') }}</li>
            <li>{{ $t('privacy.section3Item2') }}</li>
            <li>{{ $t('privacy.section3Item3') }}</li>
            <li>{{ $t('privacy.section3Item4') }}</li>
          </ul>
        </div>

        <div class="section">
          <h3>{{ $t('privacy.section4Title') }}</h3>
          <p>{{ $t('privacy.section4Desc') }}</p>
          <ul>
            <li>{{ $t('privacy.section4Item1') }}</li>
            <li>{{ $t('privacy.section4Item2') }}</li>
            <li>{{ $t('privacy.section4Item3') }}</li>
            <li>{{ $t('privacy.section4Item4') }}</li>
          </ul>
        </div>

        <div class="section">
          <h3>{{ $t('privacy.section5Title') }}</h3>
          <p>{{ $t('privacy.section5Desc') }}</p>
        </div>

        <div class="section">
          <h3>{{ $t('privacy.section6Title') }}</h3>
          <p>{{ $t('privacy.section6Desc') }}</p>
          <ul>
            <li>{{ $t('privacy.section6Item1') }}</li>
            <li>{{ $t('privacy.section6Item2') }}</li>
            <li>{{ $t('privacy.section6Item3') }}</li>
            <li>{{ $t('privacy.section6Item4') }}</li>
            <li>{{ $t('privacy.section6Item5') }}</li>
          </ul>
        </div>

        <div class="section">
          <h3>{{ $t('privacy.section7Title') }}</h3>
          <p>{{ $t('privacy.section7Desc') }}</p>
        </div>

        <div class="section">
          <h3>{{ $t('privacy.section8Title') }}</h3>
          <p>{{ $t('privacy.section8Desc') }}</p>
          <p>{{ $t('privacy.email') }}</p>
          <p>{{ $t('privacy.support') }}</p>
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
