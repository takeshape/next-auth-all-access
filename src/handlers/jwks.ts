import type { HandlerOptions } from '../types.ts'

function handler(options: HandlerOptions) {
  return options.jwks
}

export default handler
