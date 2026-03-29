import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getBalanceApi, depositApi, withdrawApi, getTransactionsApi } from '@/api/wallet'

export const useWalletStore = defineStore('wallet', () => {
  const balance = ref(0)
  const transactions = ref([])

  async function fetchBalance() {
    const res = await getBalanceApi()
    if (res?.balance !== undefined) balance.value = res.balance
    return balance.value
  }

  async function deposit(amount) {
    const res = await depositApi({ amount: Number(amount) })
    if (res?.balance !== undefined) balance.value = res.balance
    else balance.value += Number(amount)
    transactions.value.unshift({
      id: res?.id || Date.now(),
      type: 'deposit',
      amount: Number(amount),
      time: new Date().toISOString(),
      status: 'success'
    })
    return { success: true, balance: balance.value }
  }

  async function withdraw(amount) {
    const res = await withdrawApi({ amount: Number(amount) })
    if (res?.balance !== undefined) balance.value = res.balance
    else balance.value -= Number(amount)
    transactions.value.unshift({
      id: res?.id || Date.now(),
      type: 'withdraw',
      amount: Number(amount),
      time: new Date().toISOString(),
      status: 'pending'
    })
    return { success: true, balance: balance.value }
  }

  return { balance, transactions, fetchBalance, deposit, withdraw }
})
