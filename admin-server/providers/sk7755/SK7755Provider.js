/**
 * SK7755Provider — IProvider implementation for the SK7755 aggregator.
 * Delegates to existing services/sk7755/ functions.
 */
import { BaseProvider } from '../IProvider.js'
import { login as sk7755Login, getBalance as sk7755GetBalance } from '../../services/sk7755/client.js'
import { syncAll, getCachedGames } from '../../services/sk7755/gameSync.js'

export class SK7755Provider extends BaseProvider {
  constructor() {
    super('sk7755', 'SK7755 Aggregator')
  }

  async launchGame(userAccount, gameId, opts = {}) {
    const { platform, game_code } = opts
    if (!platform || !game_code) {
      throw new Error('platform and game_code required for SK7755')
    }
    const result = await sk7755Login(userAccount, { platform, game_code })
    if (result.code === '0000' && result.result?.url) {
      return { url: result.result.url }
    }
    throw new Error(result.message || 'SK7755 launch failed')
  }

  async syncGameList() {
    return await syncAll()
  }

  async handleCallback(payload) {
    // Callback handling is done via callbackRouter.js / callbackHandler.js
    // This is a pass-through — the callback route calls the handler directly
    throw new Error('Use callbackRouter for SK7755 callbacks')
  }

  async getBalance(userAccount) {
    const result = await sk7755GetBalance(userAccount)
    if (result.code === '0000') {
      return parseFloat(result.result?.balance || 0)
    }
    return 0
  }
}
