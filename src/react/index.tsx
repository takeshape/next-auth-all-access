import {useSession} from 'next-auth/react';
import {useEffect, useState} from 'react';
import type {AllAccessSession, AllAccessToken} from '../types.js';

import {GetClientTokenOptions, UseAllAccessOptions} from './types.js';

export * from './types.js';

/**
 * A helper to get the client's token from the NextAuth session.
 */
export function getClientToken({clientId, session}: GetClientTokenOptions) {
  if (!session) {
    return;
  }

  return (session as AllAccessSession).allAccess?.[clientId];
}

/**
 * A convenience hook to provide the client token from the NextAuth session
 * for a configured client. Must be wrapped in the NextAuth SessionProvider.
 */
export function useAllAccess({clientId, ...options}: UseAllAccessOptions) {
  const {data: session, status} = useSession({required: false, ...options});
  const [isAuthenticated, setIsAuthenticated] = useState(
    status === 'authenticated',
  );
  const [clientToken, setClientToken] = useState<AllAccessToken | undefined>();

  useEffect(() => {
    setIsAuthenticated(status === 'authenticated');
  }, [status]);

  useEffect(() => {
    const clientToken = getClientToken({clientId, session: session ?? undefined});
    if (clientToken) {
      setClientToken(clientToken);
    } else {
      setClientToken(undefined);
    }
  }, [clientId, session]);

  return {isAuthenticated, clientToken};
}
