import type { HandlerOptions } from '../types.js'

function handler(options: HandlerOptions) {
  return options.jwks
}

export default handler
