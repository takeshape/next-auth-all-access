import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'
import { NextAuthConfig } from 'next-auth'
import jwksHandler from '../handlers/jwks.js'
import openidConfigurationHandler from '../handlers/openid-configuration.js'
import { createInitializerOptions, createSessionCallback } from '../lib/index.js'
import type { HandlerOptions, NextAuthAllAccessOptions } from '../types.js'

/**
 * Wrap NextAuth returning a v4-style API handler
 */
function wrapNextAuth(options: HandlerOptions, nextAuth: NextApiHandler): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    let {
      query: { nextauth: route },
    } = req

    route = (Array.isArray(route) ? route : [route]).join('/')

    switch (route) {
      case 'all-access/jwks.json': {
        const response = jwksHandler(options)
        res.send(response)
        return
      }

      case 'all-access/.well-known/openid-configuration': {
        const response = openidConfigurationHandler(options)
        res.send(response)
        return
      }

      default: {
        await nextAuth(req, res)
      }
    }
  }
}

export const createNextAuthAllAccess = (options: NextAuthAllAccessOptions) => {
  const { handlerOptions, signingOptions } = createInitializerOptions(options)

  return (createNextAuth: (options: unknown) => any, nextAuthOptions: unknown): NextApiHandler => {
    const config = nextAuthOptions as NextAuthConfig
    const sessionCallback = createSessionCallback(signingOptions, config)

    config.callbacks = {
      ...config.callbacks,
      session: sessionCallback,
    }

    return wrapNextAuth(handlerOptions, createNextAuth(nextAuthOptions))
  }
}

export default createNextAuthAllAccess
