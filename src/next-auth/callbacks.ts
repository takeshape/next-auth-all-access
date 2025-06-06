import type { AuthConfig } from '@auth/core'
import type { NextAuthConfig } from 'next-auth'
import type { CreateSigningFnsParameters } from '../lib/index.ts'
import { createSigningFns } from '../lib/index.ts'

/**
 * Creates a session callback wrapper that adds signed tokens for
 * all the configured clients.
 */
export function createSessionCallback(
  signingOptions: CreateSigningFnsParameters,
  nextAuthOptions: Pick<NextAuthConfig, 'callbacks'>,
): NonNullable<AuthConfig['callbacks']>['session'] {
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
