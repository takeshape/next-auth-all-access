import fs from 'node:fs'
import type { HandlerOptions, NextAuthAllAccessOptions } from '../types.ts'
import { importPkcs8 } from './key.ts'
import type { CreateSigningFnsParameters } from './token.ts'
import { getIssuer, getOrigin, isJsonWebKeySet, sanitizeKey } from './utils.ts'

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
