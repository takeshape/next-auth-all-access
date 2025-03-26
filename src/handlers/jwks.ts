import type { HandlerOptions } from '../lib/types.ts'

function handler(options: HandlerOptions) {
  return options.jwks
}

export default handler
