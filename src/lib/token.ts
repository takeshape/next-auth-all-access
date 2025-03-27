import type { CryptoKey } from 'jose'
import { SignJWT } from 'jose'
import type { AllAccessToken, AuthToken, Client } from './types.ts'
import { pick, renameKeys } from './utils.ts'

export interface CreateSigningFnParameters {
  privateKey: CryptoKey
  issuer: string
  kid: string
  algorithm: string
}

export type SigningFunction = (token: AuthToken) => Promise<AllAccessToken>

export function createSigningFn(
  { privateKey, kid, issuer, algorithm }: CreateSigningFnParameters,
  client: Client,
): SigningFunction {
  const { id, expiration, audience, allowedClaims, renameClaims } = client

  return async (token: AuthToken): Promise<AllAccessToken> => {
    if (allowedClaims) {
      token = pick(token, ['exp', 'iat', ...allowedClaims])
    }

    if (renameClaims) {
      token = renameKeys(token, renameClaims)
    }

    const issuedAt = Date.now()

    const accessToken = await new SignJWT(token)
      .setProtectedHeader({
        typ: 'JWT',
        alg: algorithm,
        kid,
      })
      .setIssuer(issuer)
      .setAudience(audience)
      .setIssuedAt(issuedAt)
      .setExpirationTime(expiration ?? '6h')
      .sign(privateKey)

    return { id, issuedAt, algorithm, accessToken }
  }
}

export interface CreateSigningFnsParameters extends CreateSigningFnParameters {
  clients: Client[]
}

export function createSigningFns({ clients, ...signingFnParams }: CreateSigningFnsParameters) {
  const accessTokenSigningFns = clients.map((client) => createSigningFn(signingFnParams, client))

  return async (token: AuthToken) => {
    const signedTokens = await Promise.all(accessTokenSigningFns.map(async (fn) => fn(token)))
    return Object.fromEntries(signedTokens.map((v) => [v.id, v]))
  }
}
