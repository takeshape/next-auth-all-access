import type { HandlerOptions } from '../types.ts'

function handler(options: HandlerOptions) {
  const { issuer, origin, jwksUriBaseUrl } = options
  return {
    issuer,
    // TODO Need to sniff this or at least make it configurable
    jwks_uri: `${origin}/${jwksUriBaseUrl}/jwks.json`,
  }
}

export default handler
