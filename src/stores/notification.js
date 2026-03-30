import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const defaultMessages = [
  {
    id: 'm1',
    type: 'system',
    title: 'System Maintenance Notice',
    summary: 'Scheduled maintenance on April 2, 2026 from 02:00-04:00 UTC+8',
    content: 'Dear users, we will perform scheduled maintenance on April 2, 2026 from 02:00 to 04:00 (UTC+8). During this period, the platform will be temporarily unavailable. We apologize for any inconvenience and appreciate your understanding. All pending bets and transactions will be processed after maintenance.',
    time: '2026-03-30 08:00',
    read: false,
    icon: 'volume-o'
  },
  {
    id: 'm2',
    type: 'personal',
    title: 'Deposit Confirmed',
    summary: 'Your deposit of 500 USDT has been credited to your account',
    content: 'Your deposit of 500 USDT via TRC-20 has been successfully confirmed and credited to your account. Transaction ID: TXN20260329001. Current balance: 1,580.00 USDT. If you have any questions, please contact our support team.',
    time: '2026-03-29 20:15',
    read: false,
    icon: 'balance-o'
  },
  {
    id: 'm3',
    type: 'personal',
    title: 'Withdrawal Processed',
    summary: 'Your withdrawal of 200 USDT has been processed',
    content: 'Your withdrawal request of 200 USDT to your TRC-20 wallet has been processed successfully. Transaction hash: 0xabc...def. Please allow up to 30 minutes for the funds to appear in your wallet. If you don\'t receive the funds within 2 hours, please contact support.',
    time: '2026-03-29 18:30',
    read: true,
    icon: 'cash-back-record'
  },
  {
    id: 'm4',
    type: 'system',
    title: 'New Promotion: Weekend Bonus',
    summary: 'Get 50% deposit bonus this weekend! Limited time offer.',
    content: 'Exciting news! This weekend (March 29-30), all deposits receive a 50% bonus up to 500 USDT! Simply make a deposit and the bonus will be automatically credited to your account. Wagering requirement: 15x. Maximum bonus: 500 USDT. This promotion cannot be combined with other offers.',
    time: '2026-03-29 10:00',
    read: false,
    icon: 'gift-o'
  },
  {
    id: 'm5',
    type: 'personal',
    title: 'Promotion Claimed',
    summary: 'You have claimed the Daily Sign-in reward: 5 USDT',
    content: 'Congratulations! You have successfully claimed the Daily Sign-in reward of 5 USDT. This has been added to your account balance. Keep signing in every day for bigger rewards! Day 7 streak bonus: 88 USDT.',
    time: '2026-03-29 09:00',
    read: true,
    icon: 'gift-o'
  },
  {
    id: 'm6',
    type: 'system',
    title: 'Security Alert',
    summary: 'New login detected from a new device',
    content: 'We detected a new login to your account from Chrome Browser (IP: 183.xx.xx.42, Location: Shenzhen, Guangdong) on March 29, 2026 at 18:40. If this was you, you can ignore this message. If you did not authorize this login, please change your password immediately and contact support.',
    time: '2026-03-28 18:40',
    read: true,
    icon: 'shield-o'
  },
  {
    id: 'm7',
    type: 'system',
    title: 'VIP Level Upgrade',
    summary: 'Congratulations! You have been upgraded to VIP3',
    content: 'Congratulations! Based on your gaming activity and deposits, you have been upgraded to VIP Level 3! Your new privileges include: 128U upgrade bonus (auto-credited), 38U monthly red packet, 0.5% loss rebate, faster withdrawal processing. Enjoy your enhanced VIP experience!',
    time: '2026-03-28 08:00',
    read: true,
    icon: 'medal-o'
  },
  {
    id: 'm8',
    type: 'personal',
    title: 'Deposit Confirmed',
    summary: 'Your deposit of 1,000 USDT has been credited',
    content: 'Your deposit of 1,000 USDT via TRC-20 has been successfully confirmed and credited to your account. Transaction ID: TXN20260328002. Current balance: 2,080.00 USDT.',
    time: '2026-03-28 15:20',
    read: true,
    icon: 'balance-o'
  }
]

export const useNotificationStore = defineStore('notification', () => {
  const messages = ref(JSON.parse(localStorage.getItem('notifications') || 'null') || defaultMessages)

  const unreadCount = computed(() => messages.value.filter(m => !m.read).length)

  function markAsRead(id) {
    const msg = messages.value.find(m => m.id === id)
    if (msg) {
      msg.read = true
      saveToStorage()
    }
  }

  function markAllAsRead() {
    messages.value.forEach(m => { m.read = true })
    saveToStorage()
  }

  function deleteMessage(id) {
    messages.value = messages.value.filter(m => m.id !== id)
    saveToStorage()
  }

  function getMessagesByType(type) {
    if (type === 'all') return messages.value
    return messages.value.filter(m => m.type === type)
  }

  function getUnreadByType(type) {
    if (type === 'all') return messages.value.filter(m => !m.read)
    return messages.value.filter(m => m.type === type && !m.read)
  }

  function saveToStorage() {
    localStorage.setItem('notifications', JSON.stringify(messages.value))
  }

  return { messages, unreadCount, markAsRead, markAllAsRead, deleteMessage, getMessagesByType, getUnreadByType }
})
