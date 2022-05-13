import fs from 'fs';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { NextAuthOptions } from 'next-auth';
import { createSessionCallback } from './callbacks.js';
import jwksHandler from './handlers/jwks.js';
import openidConfigurationHandler from './handlers/openid-configuration.js';
import { importPKCS8 } from './key.js';
import type { CreateSigningFnsParams } from './token.js';
import type { HandlerOptions, NextAuthAllAccessOptions } from './types.js';
import { getIssuer, getOrigin, sanitizeKey } from './utils.js';

function NextAuthAllAccessHandler(options: HandlerOptions, nextAuth: any) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    let {
      query: { nextauth: route }
    } = req;

    route = (Array.isArray(route) ? route : [route]).join('/');

    switch (route) {
      case 'all-access/jwks.json':
        return jwksHandler(options, req, res);
      case 'all-access/.well-known/openid-configuration':
        return openidConfigurationHandler(options, req, res);
      default:
        return nextAuth(req, res);
    }
  };
}

/**
 * Wraps NextAuth with AllAccess code, which adds AllAccess endpoints and inserts
 * access tokens into the session object.
 */
function NextAuthAllAccess(options: NextAuthAllAccessOptions) {
  const jwksPath = options.jwksPath ?? process.env['ALLACCESS_JWKS_PATH'];
  const privateKey = options.privateKey ?? process.env['ALLACCESS_PRIVATE_KEY'];

  if (!jwksPath || !privateKey) {
    throw new Error('JWKS file path and private key are required');
  }

  const jwks = JSON.parse(fs.readFileSync(jwksPath, 'utf-8'));
  const issuer = getIssuer(options.issuer);

  const handlerOptions: HandlerOptions = {
    issuer,
    origin: getOrigin(),
    jwks
  };

  const signingOptions: CreateSigningFnsParams = {
    clients: options.clients,
    privateKey: importPKCS8(sanitizeKey(privateKey)),
    issuer,
    kid: jwks.keys[0].kid
  };

  return (NextAuth: (opt: NextAuthOptions) => any, nextAuthOptions: NextAuthOptions) => {
    const sessionCallback = createSessionCallback(signingOptions, nextAuthOptions);

    nextAuthOptions.callbacks = {
      ...nextAuthOptions.callbacks,
      session: sessionCallback
    };

    return NextAuthAllAccessHandler(handlerOptions, NextAuth(nextAuthOptions));
  };
}

export default NextAuthAllAccess;
