import type { KeyLike } from 'jose'
import { SignJWT } from 'jose'
import type { AllAccessToken, AuthToken, Client } from './types.ts'
import { pick, renameKeys } from './utils.ts'

export interface CreateSigningFnParameters {
  privateKey: KeyLike
  issuer: string
  kid: string
}

export type SigningFunction = (token: AuthToken) => Promise<AllAccessToken>

export function createSigningFn(
  { privateKey, kid, issuer }: CreateSigningFnParameters,
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

export interface CreateSigningFnsParameters extends CreateSigningFnParameters {
  clients: Client[]
}

export function createSigningFns({ clients, privateKey, issuer, kid }: CreateSigningFnsParameters) {
  const accessTokenSigningFns = clients.map((client) =>
    createSigningFn(
      {
        privateKey,
        issuer,
        kid,
      },
      client,
    ),
  )

  return async (token: AuthToken) => {
    const signedTokens = await Promise.all(accessTokenSigningFns.map(async (fn) => fn(token)))
    return Object.fromEntries(signedTokens.map((v) => [v.id, v]))
  }
}
