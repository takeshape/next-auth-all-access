import type { NextAuthConfig } from 'next-auth'
import fs from 'node:fs'
import { createSessionCallback } from './callbacks.js'
import { importPkcs8 } from './key.js'
import type { CreateSigningFnsParameters } from './token.js'
import type { HandlerOptions, NextAuthAllAccessOptions } from './types.js'
import { isJsonWebKeySet } from './types.js'
import { getIssuer, getOrigin, sanitizeKey } from './utils.js'

/**
 * Wraps NextAuth with AllAccess code, which adds AllAccess endpoints and inserts
 * access tokens into the session object.
 */
export function createInitializer(handler: any) {
  return (options: NextAuthAllAccessOptions) => {
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
    }

    const signingOptions: CreateSigningFnsParameters = {
      clients: options.clients,
      privateKey: importPkcs8(sanitizeKey(privateKey)),
      issuer,
      kid,
    }

    return (createNextAuth: (opt: NextAuthConfig) => any, nextAuthOptions: NextAuthConfig) => {
      const sessionCallback = createSessionCallback(signingOptions, nextAuthOptions)

      nextAuthOptions.callbacks = {
        ...nextAuthOptions.callbacks,
        session: sessionCallback,
      }

      return handler(handlerOptions, createNextAuth(nextAuthOptions))
    }
  }
}
