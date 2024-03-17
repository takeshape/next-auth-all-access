import type { HandlerOptions } from '../types.js'

function handler(options: HandlerOptions) {
  const { issuer, origin } = options
  return {
    issuer,
    jwks_uri: `${origin}/api/auth/all-access/jwks.json`,
  }
}

export default handler
