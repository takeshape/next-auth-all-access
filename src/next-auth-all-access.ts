import fs from 'node:fs'
import { importPkcs8 } from './key.js'
import type { CreateSigningFnsParameters } from './token.js'
import type { HandlerOptions, NextAuthAllAccessOptions } from './types.js'
import { isJsonWebKeySet } from './types.js'
import { getIssuer, getOrigin, sanitizeKey } from './utils.js'

export function createInitializerOptions(options: NextAuthAllAccessOptions) {
  const _jwks = options.jwks
  const jwksPath = options.jwksPath ?? process.env['ALLACCESS_JWKS_PATH']
  const privateKey = options.privateKey ?? process.env['ALLACCESS_PRIVATE_KEY']

  if ((!jwksPath && !_jwks) || !privateKey) {
    throw new Error('JWKS file path and private key are required')
  }

  let jwks

  if (jwksPath) {
    jwks = JSON.parse(fs.readFileSync(jwksPath, 'utf-8')) as unknown
  } else {
    jwks = _jwks
  }

  if (!isJsonWebKeySet(jwks)) {
    throw new Error('JWKS file is invalid')
  }

  const kid = jwks.keys[0]?.kid

  if (!kid) {
    throw new Error('JWKS file is invalid')
  }

  const issuer = getIssuer(options.issuer)

  const handlerOptions: HandlerOptions = {
    issuer,
    origin: getOrigin(options.origin),
    jwks,
    jwksUriBaseUrl: options.jwksUriBaseUrl ?? 'api/oidc',
  }

  const signingOptions: CreateSigningFnsParameters = {
    clients: options.clients,
    privateKey: importPkcs8(sanitizeKey(privateKey)),
    issuer,
    kid,
  }

  return { handlerOptions, signingOptions }
}
