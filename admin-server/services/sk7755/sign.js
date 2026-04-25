import crypto from 'crypto'

/**
 * Generate SK7755 API signature.
 *
 * Algorithm:
 *  1. Sort params by key ASCII ascending
 *  2. Concatenate as key1=value1&key2=value2&key=<md5key>
 *  3. MD5 hex lowercase
 */
export function generateSign(params, md5Key) {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&')

  const raw = `${sorted}&key=${md5Key}`
  return crypto.createHash('md5').update(raw).digest('hex')
}
