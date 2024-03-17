import type NextAuth from 'next-auth'
import type { NextAuthConfig, NextAuthResult } from 'next-auth'
import type { NextRequest } from 'next/server'
import { createSessionCallback } from '../callbacks.js'
import jwksHandler from '../handlers/jwks.js'
import openidConfigurationHandler from '../handlers/openid-configuration.js'
import { createInitializerOptions } from '../next-auth-all-access.js'
import type { HandlerOptions, NextAuthAllAccessOptions } from '../types.js'

/**
 * Wrap NextAuth returning a v5-style `NextAuthResult`
 */
function wrapNextAuth(options: HandlerOptions, nextAuth: NextAuthResult) {
  const { GET } = nextAuth.handlers

  const getWrapper = async (req: NextRequest) => {
    const { pathname } = req.nextUrl

    if (pathname.endsWith('all-access/jwks.json')) {
      const response = jwksHandler(options)
      return Response.json(response)
    }

    if (pathname.endsWith('all-access/.well-known/openid-configuration')) {
      const response = openidConfigurationHandler(options)
      return Response.json(response)
    }

    return GET(req)
  }

  return {
    ...nextAuth,
    handlers: {
      ...nextAuth.handlers,
      GET: getWrapper,
    },
  }
}

export const createNextAuthAllAccess = (options: NextAuthAllAccessOptions) => {
  const { handlerOptions, signingOptions } = createInitializerOptions(options)

  return (createNextAuth: typeof NextAuth, nextAuthOptions: NextAuthConfig): NextAuthResult => {
    const sessionCallback = createSessionCallback(signingOptions, nextAuthOptions)

    nextAuthOptions.callbacks = {
      ...nextAuthOptions.callbacks,
      session: sessionCallback,
    }

    return wrapNextAuth(handlerOptions, createNextAuth(nextAuthOptions))
  }
}
