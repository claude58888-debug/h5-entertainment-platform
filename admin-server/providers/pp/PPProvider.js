/**
 * PPProvider — IProvider implementation for Pragmatic Play direct integration.
 * Delegates to existing pp-integration.js functions.
 */
import { BaseProvider } from '../IProvider.js'

export class PPProvider extends BaseProvider {
  constructor() {
    super('pp', 'Pragmatic Play')
    this._integration = null
  }

  _getIntegration() {
    if (!this._integration) {
      // Lazy import to avoid circular deps
      this._integration = import('../../pp-integration.js')
    }
    return this._integration
  }

  async launchGame(userAccount, gameId, opts = {}) {
    const pp = await this._getIntegration()
    if (!pp.launchGame) {
      throw new Error('PP launchGame not available')
    }
    return await pp.launchGame(userAccount, gameId, opts)
  }

  async syncGameList() {
    const pp = await this._getIntegration()
    if (pp.syncGameList) {
      return await pp.syncGameList()
    }
    return 0
  }

  async handleCallback(payload) {
    // PP callbacks are handled via pp-routes.js
    throw new Error('Use pp-routes for PP callbacks')
  }

  async getBalance(userAccount) {
    // PP uses seamless wallet — balance is managed locally
    return 0
  }
}
