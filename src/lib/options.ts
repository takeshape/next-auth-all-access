import fs from 'node:fs'
import type { HandlerOptions, NextAuthAllAccessOptions } from '../types.ts'
import { importPkcs8 } from './key.ts'
import type { CreateSigningFnParameters } from './token.ts'
import { getIssuer, getOrigin, isJsonWebKeySet, sanitizeKey } from './utils.ts'

export function getJwks(options: Pick<NextAuthAllAccessOptions, 'jwks' | 'jwksPath'>) {
  const { jwks, jwksPath = process.env['ALLACCESS_JWKS_PATH'] } = options

  if (!jwksPath && !jwks) {
    throw new Error('jwks or jwksPath are required')
  }

  let validJwks: unknown

  if (jwks) {
    validJwks = jwks
  } else if (jwksPath) {
    validJwks = JSON.parse(fs.readFileSync(jwksPath, 'utf-8'))
  }

  if (!isJsonWebKeySet(validJwks)) {
    throw new Error('JWKS is invalid')
  }

  return validJwks
}

export function createSigningOptions(
  options: Pick<NextAuthAllAccessOptions, 'issuer' | 'privateKey' | 'jwks' | 'jwksPath'>,
): CreateSigningFnParameters {
  const { issuer = getIssuer(), privateKey = process.env['ALLACCESS_PRIVATE_KEY'] } = options
  const jwks = getJwks(options)

  if (!privateKey) {
    throw new Error('privateKey is required')
  }

  return {
    privateKey: importPkcs8(sanitizeKey(privateKey)),
    issuer,
    kid: jwks.keys[0].kid,
  }
}

export function createHandlerOptions(
  options: Pick<
    NextAuthAllAccessOptions,
    'issuer' | 'origin' | 'jwks' | 'jwksPath' | 'jwksUriBaseUrl'
  >,
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

export function createInitializerOptions(options: NextAuthAllAccessOptions) {
  const jwks = getJwks(options)
  return {
    handlerOptions: createHandlerOptions({ ...options, jwks }),
    signingOptions: {
      ...createSigningOptions({ ...options, jwks }),
      clients: options.clients,
    },
  }
}
