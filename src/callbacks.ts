import type { CallbacksOptions } from '@auth/core/types'
import type { NextAuthConfig } from 'next-auth'
import type { CreateSigningFnsParameters } from './token.js'
import { createSigningFns } from './token.js'

/**
 * Creates a session callback wrapper that adds signed tokens for
 * all the configured clients.
 */
export function createSessionCallback(
  signingOptions: CreateSigningFnsParameters,
  nextAuthOptions: NextAuthConfig,
): CallbacksOptions['session'] {
  const signAccessTokens = createSigningFns(signingOptions)

  const originalSessionCallback = nextAuthOptions.callbacks?.session

  return async (params) => {
    const { session, token } = params

    session['allAccess'] = await signAccessTokens(token)

    if (originalSessionCallback) {
      return originalSessionCallback(params)
    }

    return session
  }
}
