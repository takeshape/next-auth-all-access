import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'
import jwksHandler from '../handlers/jwks.js'
import openidConfigurationHandler from '../handlers/openid-configuration.js'
import { createInitializer } from '../next-auth-all-access.js'
import type { HandlerOptions } from '../types.js'

/**
 * Handler for the `pages` folder / next-auth v4
 */
function pagesHandler(options: HandlerOptions, nextAuth: NextApiHandler) {
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

export const createNextAuthAllAccess = createInitializer(pagesHandler)
