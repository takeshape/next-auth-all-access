import type { CallbacksOptions, NextAuthOptions } from 'next-auth';
import type { CreateSigningFnsParams } from './token.js';
import { createSigningFns } from './token.js';

/**
 * Creates a session callback wrapper that adds signed tokens for
 * all the configured clients.
 */
export function createSessionCallback(
  signingOptions: CreateSigningFnsParams,
  nextAuthOptions: NextAuthOptions
): CallbacksOptions['session'] {
  const signAccessTokens = createSigningFns(signingOptions);

  const originalSessionCallback = nextAuthOptions.callbacks?.session;

  return async (params) => {
    const { session, token } = params;

    session['allAccess'] = await signAccessTokens(token);

    if (originalSessionCallback) {
      return await originalSessionCallback(params);
    }

    return session;
  };
}
