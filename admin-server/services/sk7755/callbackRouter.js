import { Router } from 'express'
import { processCallback } from './callbackHandler.js'

const router = Router()

router.post('/wallet', (req, res) => {
  try {
    const body = req.body

    if (!body || !body.action || !body.orderNo) {
      return res.json({ code: '9999', message: 'Missing required fields' })
    }

    processCallback(body)

    return res.json({ code: '0000', message: 'Success' })
  } catch (err) {
    console.error('[SK7755 Callback] Error:', err.message)
    return res.json({ code: '9999', message: 'Internal Error' })
  }
})

export default router
