<template>
  <div class="security-page">
    <van-nav-bar title="Security Center" left-arrow @click-left="$router.back()" fixed :style="{ maxWidth: '480px', margin: '0 auto' }" />
    <div class="page-content" style="padding-top: 46px;">
      <div class="security-items">
        <div class="sec-item" @click="showAccountDialog = true">
          <div class="sec-left"><span class="sec-icon">👤</span><div><h4>Account Settings</h4><p>Set your account name</p></div></div>
          <span class="sec-status" :class="{ set: accountSet }">{{ accountSet ? 'Set' : 'Not Set' }}</span>
        </div>
        <div class="sec-item" @click="showEmailDialog = true">
          <div class="sec-left"><span class="sec-icon">📧</span><div><h4>Email Binding</h4><p>Bind email for recovery</p></div></div>
          <span class="sec-status" :class="{ set: emailSet }">{{ emailSet ? 'Bound' : 'Not Bound' }}</span>
        </div>
        <div class="sec-item" @click="showWithdrawPwdDialog = true">
          <div class="sec-left"><span class="sec-icon">🔐</span><div><h4>Withdrawal Password</h4><p>Set 6-digit withdrawal PIN</p></div></div>
          <span class="sec-status" :class="{ set: withdrawPwdSet }">{{ withdrawPwdSet ? 'Set' : 'Not Set' }}</span>
        </div>
        <div class="sec-item" @click="showWalletDialog = true">
          <div class="sec-left"><span class="sec-icon">💳</span><div><h4>Wallet Address</h4><p>Manage USDT TRC-20 address</p></div></div>
          <span class="sec-status" :class="{ set: walletSet }">{{ walletSet ? '1 Address' : 'Not Set' }}</span>
        </div>
        <div class="sec-item" @click="showLoginPwdDialog = true">
          <div class="sec-left"><span class="sec-icon">🔑</span><div><h4>Login Password</h4><p>Change your login password</p></div></div>
          <span class="arrow">→</span>
        </div>
      </div>
    </div>

    <!-- Account Dialog -->
    <van-dialog v-model:show="showAccountDialog" title="Set Account" show-cancel-button @confirm="accountSet = true">
      <van-field v-model="accountName" placeholder="Enter account name" class="dialog-field" />
    </van-dialog>
    <!-- Email Dialog -->
    <van-dialog v-model:show="showEmailDialog" title="Bind Email" show-cancel-button @confirm="emailSet = true">
      <van-field v-model="email" type="email" placeholder="Enter email address" class="dialog-field" />
    </van-dialog>
    <!-- Withdrawal Password -->
    <van-dialog v-model:show="showWithdrawPwdDialog" title="Set Withdrawal PIN" show-cancel-button @confirm="withdrawPwdSet = true">
      <van-field v-model="withdrawPwd" type="password" maxlength="6" placeholder="Enter 6-digit PIN" class="dialog-field" />
    </van-dialog>
    <!-- Wallet -->
    <van-dialog v-model:show="showWalletDialog" title="USDT Wallet Address" show-cancel-button @confirm="walletSet = true">
      <van-field v-model="walletAddr" placeholder="Enter TRC-20 address" class="dialog-field" />
    </van-dialog>
    <!-- Login Password -->
    <van-dialog v-model:show="showLoginPwdDialog" title="Change Password" show-cancel-button>
      <van-field v-model="oldPwd" type="password" placeholder="Current password" class="dialog-field" />
      <van-field v-model="newPwd" type="password" placeholder="New password" class="dialog-field" />
    </van-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const showAccountDialog = ref(false)
const showEmailDialog = ref(false)
const showWithdrawPwdDialog = ref(false)
const showWalletDialog = ref(false)
const showLoginPwdDialog = ref(false)
const accountSet = ref(false)
const emailSet = ref(false)
const withdrawPwdSet = ref(false)
const walletSet = ref(false)
const accountName = ref('')
const email = ref('')
const withdrawPwd = ref('')
const walletAddr = ref('')
const oldPwd = ref('')
const newPwd = ref('')
</script>

<style lang="scss" scoped>
.page-content { padding: 16px; }
.security-items { display: flex; flex-direction: column; gap: 8px; }
.sec-item { display: flex; align-items: center; justify-content: space-between; background: $bg-card; padding: 16px; border-radius: 12px; cursor: pointer; }
.sec-left { display: flex; align-items: center; gap: 12px;
  h4 { font-size: 15px; margin-bottom: 2px; }
  p { font-size: 12px; color: $text-muted; }
}
.sec-icon { font-size: 28px; }
.sec-status { font-size: 12px; color: #ef4444; &.set { color: #10b981; } }
.arrow { color: $text-muted; font-size: 18px; }
.dialog-field { margin: 12px 16px; background: $bg-card; border-radius: 8px; }
</style>
