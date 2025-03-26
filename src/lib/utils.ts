import { JSONWebKeySet } from 'jose'
import crypto from 'node:crypto'
import { JWKS } from './types.ts'

/**
 * Derive a JWKS Key ID an md5 of the key being identified.
 */
export function getJwksKid(key: string) {
  return (
    crypto
      .createHash('md5')
      // The key can be a multiline string when coming from options, so normalize
      .update(key.trim().replace(/\n/g, '\\n'))
      .digest('hex')
  )
}

function getVercelUrl() {
  return process.env['VERCEL_URL'] ? `https://${process.env['VERCEL_URL']}` : null
}

export function getOrigin(origin?: string) {
  const url = new URL(
    origin ?? process.env['NEXTAUTH_URL'] ?? getVercelUrl() ?? 'http://localhost:3000/',
  )
  return url.origin
}

export function getIssuer(issuer?: string) {
  // Explicit values are used literally, otherwise use a URL.
  // When using the URL add a trailing slash.
  return issuer ?? process.env['ALLACCESS_ISSUER'] ?? `${getOrigin()}/`
}

export function sanitizeKey(key: string) {
  return key.replace(/['|"]/g, '').trim().replace(/\\n/g, '\n')
}

export function pick(obj: Record<string, unknown>, props: string[]): Record<string, unknown> {
  return props.reduce((p, c) => ({ ...p, [c]: obj[c] }), {})
}

export function renameKeys<T extends Record<string, unknown>>(
  obj: T,
  newKeys: Record<string, string>,
): T {
  const keyValues = Object.keys(obj).map((key) => {
    const newKey = newKeys[key] ?? key
    return { [newKey]: obj[key] }
  })

  return Object.assign({}, ...keyValues) as T
}

export function isJsonWebKeySet(maybeJwks: unknown): maybeJwks is JWKS {
  const obj = maybeJwks as JSONWebKeySet
  return Boolean(Array.isArray(obj?.keys) && obj.keys.length && obj.keys.every((k) => k.kid))
}
