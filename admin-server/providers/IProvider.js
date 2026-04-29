/**
 * IProvider — Unified game provider interface.
 *
 * All aggregator / direct-integration providers must implement these methods.
 * This decouples the H5/Admin layer from specific provider implementations.
 */

/**
 * @typedef {Object} IProvider
 * @property {string} code — unique provider code (e.g. 'sk7755', 'pp')
 * @property {Function} launchGame — (userAccount, gameId, opts) => { url }
 * @property {Function} syncGameList — () => number (games synced)
 * @property {Function} handleCallback — (payload) => { balance, ... }
 * @property {Function} getBalance — (userAccount) => number
 */

export class BaseProvider {
  constructor(code, name) {
    this.code = code
    this.name = name
  }

  async launchGame(userAccount, gameId, opts = {}) {
    throw new Error(`${this.code}: launchGame not implemented`)
  }

  async syncGameList() {
    throw new Error(`${this.code}: syncGameList not implemented`)
  }

  async handleCallback(payload) {
    throw new Error(`${this.code}: handleCallback not implemented`)
  }

  async getBalance(userAccount) {
    throw new Error(`${this.code}: getBalance not implemented`)
  }
}
