import { Router } from 'express'
import { processCallback } from './callbackHandler.js'

const router = Router()

router.post('/wallet', (req, res) => {
  try {
    const body = req.body

    if (!body || !body.action) {
      return res.json({ code: '9999', message: 'Missing action field' })
    }

    const result = processCallback(body)

    return res.json(result)
  } catch (err) {
    console.error('[SK7755 Callback] Error:', err.message)
    return res.json({ code: '9999', message: 'Internal Error' })
  }
})

export default router
