/**
 * Provider Registry — central registry for all game provider implementations.
 * Frontend calls unified endpoints; registry routes to the correct provider.
 */
import { SK7755Provider } from './sk7755/SK7755Provider.js'
import { PPProvider } from './pp/PPProvider.js'

const providers = new Map()

export function registerProviders() {
  providers.set('sk7755', new SK7755Provider())
  providers.set('pp', new PPProvider())
  console.log(`[ProviderRegistry] Registered ${providers.size} providers: ${[...providers.keys()].join(', ')}`)
}

export function getProvider(code) {
  return providers.get(code) || null
}

export function getAllProviders() {
  return [...providers.values()]
}

/**
 * Unified game launch — finds the right provider and launches.
 * @param {string} providerCode
 * @param {string} userAccount
 * @param {string} gameId
 * @param {Object} opts - provider-specific options (platform, game_code, etc.)
 */
export async function launchGame(providerCode, userAccount, gameId, opts = {}) {
  const provider = getProvider(providerCode)
  if (!provider) {
    throw new Error(`Unknown provider: ${providerCode}`)
  }
  return await provider.launchGame(userAccount, gameId, opts)
}
