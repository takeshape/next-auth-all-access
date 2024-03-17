import type { NextAuthResult } from 'next-auth'
import type { NextRequest } from 'next/server'
import jwksHandler from '../handlers/jwks.js'
import openidConfigurationHandler from '../handlers/openid-configuration.js'
import { createInitializer } from '../next-auth-all-access.js'
import type { HandlerOptions } from '../types.js'

/**
 * Handler for the `app` folder / next-auth v5
 */
function appHandler(options: HandlerOptions, nextAuth: NextAuthResult) {
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

export const createNextAuthAllAccess = createInitializer(appHandler)
