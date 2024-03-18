import type { NextAuthConfig } from 'next-auth'
import type { NextRequest } from 'next/server'
import { createSessionCallback } from '../callbacks.js'
import jwksHandler from '../handlers/jwks.js'
import openidConfigurationHandler from '../handlers/openid-configuration.js'
import { createInitializerOptions } from '../next-auth-all-access.js'
import type { NextAuthAllAccessOptions } from '../types.js'

/**
 * Return an updated `NextAuthConfig`, compatible with NextAuth v5
 */
export default function createNextAuthAllAccess(options: NextAuthAllAccessOptions) {
  const { handlerOptions, signingOptions } = createInitializerOptions(options)

  const GET = async (req: NextRequest) => {
    const { pathname } = req.nextUrl

    if (pathname.endsWith('/jwks.json')) {
      const response = jwksHandler(handlerOptions)
      return Response.json(response)
    }

    if (pathname.endsWith('/.well-known/openid-configuration')) {
      const response = openidConfigurationHandler(handlerOptions)
      return Response.json(response)
    }

    return new Response(null, { status: 404 })
  }

  const withAllAccess = (nextAuthConfig: NextAuthConfig) => {
    const sessionCallback = createSessionCallback(signingOptions, nextAuthConfig)

    nextAuthConfig.callbacks = {
      ...nextAuthConfig.callbacks,
      session: sessionCallback,
    }

    return nextAuthConfig
  }

  return {
    handlers: { GET },
    withAllAccess,
  }
}
