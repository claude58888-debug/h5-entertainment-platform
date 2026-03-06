import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useWalletStore = defineStore('wallet', () => {
  const balance = ref(1288.50)
  const transactions = ref([])

  function fetchBalance() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(balance.value)
      }, 300)
    })
  }

  function deposit(amount) {
    return new Promise((resolve) => {
      setTimeout(() => {
        balance.value += Number(amount)
        transactions.value.unshift({
          id: Date.now(),
          type: 'deposit',
          amount: Number(amount),
          time: new Date().toISOString(),
          status: 'success'
        })
        resolve({ success: true, balance: balance.value })
      }, 1000)
    })
  }

  function withdraw(amount) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Number(amount) > balance.value) {
          reject(new Error('Insufficient balance'))
          return
        }
        balance.value -= Number(amount)
        transactions.value.unshift({
          id: Date.now(),
          type: 'withdraw',
          amount: Number(amount),
          time: new Date().toISOString(),
          status: 'pending'
        })
        resolve({ success: true, balance: balance.value })
      }, 1000)
    })
  }

  return { balance, transactions, fetchBalance, deposit, withdraw }
})
