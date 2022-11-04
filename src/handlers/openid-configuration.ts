import type { NextApiRequest, NextApiResponse } from 'next'
import type { HandlerOptions } from '../types.js'

function handler(options: HandlerOptions, _req: NextApiRequest, res: NextApiResponse) {
  const { issuer, origin } = options
  res.send({
    issuer,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    jwks_uri: `${origin}/api/auth/all-access/jwks.json`,
  })
}

export default handler
