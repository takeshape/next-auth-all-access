import * as jose from 'jose'
import { DEFAULT_ALGORITHM } from '../constants.ts'
import type { CreateSigningFnParameters } from './token.ts'
import type { HandlerOptions, NextAuthAllAccessOptions } from './types.ts'
import { getIssuer, getOrigin, isJsonWebKeySet, safeParse, sanitizeKey } from './utils.ts'

export function getJwks(options: Pick<NextAuthAllAccessOptions, 'jwks'>) {
  const { jwks = process.env['ALLACCESS_JWKS'] } = options

  if (!jwks) {
    throw new Error('jwks or ALLACCESS_JWKS are required')
  }

  const validJwks = typeof jwks === 'string' ? safeParse(jwks) : jwks

  if (!isJsonWebKeySet(validJwks)) {
    throw new Error('JWKS is invalid')
  }

  return validJwks
}

export async function createSigningOptions(
  options: Pick<NextAuthAllAccessOptions, 'issuer' | 'privateKey' | 'jwks'>,
): Promise<CreateSigningFnParameters> {
  const { issuer = getIssuer(), privateKey = process.env['ALLACCESS_PRIVATE_KEY'] } = options

  if (!privateKey) {
    throw new Error('privateKey is required')
  }

  const jwks = getJwks(options)
  const alg = jwks.keys[0].alg ?? DEFAULT_ALGORITHM

  return {
    privateKey: await jose.importPKCS8(sanitizeKey(privateKey), alg),
    issuer,
    kid: jwks.keys[0].kid,
  }
}

export function createHandlerOptions(
  options: Pick<NextAuthAllAccessOptions, 'issuer' | 'origin' | 'jwks' | 'jwksUriBaseUrl'>,
): HandlerOptions {
  const { issuer = getIssuer() } = options
  const jwks = getJwks(options)
  const origin = getOrigin(options.origin)

  return {
    issuer,
    origin,
    jwks,
    jwksUriBaseUrl: options.jwksUriBaseUrl ?? 'api/oidc',
  }
}

export async function createInitializerOptions(options: NextAuthAllAccessOptions) {
  const jwks = getJwks(options)
  const signingOptions = await createSigningOptions({ ...options, jwks })
  return {
    handlerOptions: createHandlerOptions({ ...options, jwks }),
    signingOptions: {
      ...signingOptions,
      clients: options.clients,
    },
  }
}
