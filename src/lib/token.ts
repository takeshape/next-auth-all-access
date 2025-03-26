import type { KeyLike } from 'jose'
import { SignJWT } from 'jose'
import type { AllAccessToken, AuthToken, Client } from '../types.ts'
import { pick, renameKeys } from './utils.ts'

interface CreateSignTokenParameters {
  id: string
  privateKey: KeyLike
  expiration?: string | number
  kid: string
  issuer: string
  audience: string
  allowedClaims?: string[]
  renameClaims?: Record<string, string>
}

export function createSigningFn({
  id,
  privateKey,
  expiration,
  kid,
  issuer,
  audience,
  allowedClaims,
  renameClaims,
}: CreateSignTokenParameters) {
  return async (token: AuthToken): Promise<AllAccessToken> => {
    if (allowedClaims) {
      token = pick(token, ['exp', 'iat', ...allowedClaims])
    }

    if (renameClaims) {
      token = renameKeys(token, renameClaims)
    }

    const signed = await new SignJWT(token)
      .setProtectedHeader({
        typ: 'JWT',
        alg: 'RS256',
        kid,
      })
      .setIssuer(issuer)
      .setAudience(audience)
      .setExpirationTime(expiration ?? '6h')
      .setIssuedAt()
      .sign(privateKey)

    return { id, accessToken: signed }
  }
}

export interface CreateSigningFnsParameters {
  clients: Client[]
  privateKey: KeyLike
  issuer: string
  kid: string
}

export function createSigningFns({ clients, privateKey, issuer, kid }: CreateSigningFnsParameters) {
  const accessTokenSigningFns = clients.map((client) =>
    createSigningFn({
      ...client,
      privateKey,
      issuer,
      kid,
    }),
  )

  return async (token: AuthToken) => {
    const signedTokens = await Promise.all(accessTokenSigningFns.map(async (fn) => fn(token)))
    return Object.fromEntries(signedTokens.map((v) => [v.id, v]))
  }
}
