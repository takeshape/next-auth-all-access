# NextAuthAllAccess

NextAuthAllAccess wraps NextAuth to provide JWKS verifiable access tokens for third-party APIs.

## Provides

- A wrapper for the NextAuth handler, providing configurable, JWKS-verifiable
  client access tokens to be used with third-party APIs that require
  authentication and which you'd rather not wrap in an API route.
- The endpoint `/api/auth/all-access/jwks.json` with exposes your public JWKS
  for validation of your tokens on third-party servers.
- The endpoint `/api/auth/all-access/.well-known/openid-configuration` which is a partial
  [OpenID Connect Discovery](https://swagger.io/docs/specification/authentication/openid-connect-discovery/)
  document specifying the `issuer` and `jwks_uri` properties, so that some
  auto-discovery-compatible clients can find your JWKS URI.
- Some React utility functions.

## Installation

```
$ npm install @takeshape/next-auth-all-access
```

## Usage

First, use the CLI tool to generate your key pair:

```
$ npx @takeshape/next-auth-all-access generate-keys
```

### Using `next-auth` v4 and the `pages` folder

Import the library and wrap your `NextAuth` instance with it:

```typescript
import createNextAuthAllAccess from '@takeshape/next-auth-all-access'
import NextAuth from 'next-auth'
import Auth0Provider from 'next-auth/providers/auth0'
import jwks from '../../keys/jwks.json';

const withAllAccess = createNextAuthAllAccess({
  issuer: 'https://example.com/',
  origin: 'https://example.com/',
  jwks,
  clients: [
    {
      id: 'my-api',
      audience: 'https://my-api.com/posts',
      expiration: '6h',
      // Optional whitelist — `exp` and `iat` will always be included
      allowedClaims: ['email', 'sub'],
      // Optional rename
      renameClaims: {
        foo: 'bar',
      },
    },
  ]
})

export default withAllAccess(NextAuth, {
  providers: [
    Auth0Provider({
      clientId: process.env.AUTH0_ID,
      clientSecret: process.env.AUTH0_SECRET,
      issuer: process.env.AUTH0_ISSUER,
    }),
  ],
})
```

### Using `next-auth` v5 and the `app` folder

> [!IMPORTANT]
> When using this with `next-auth` v5, in version 1.1.0 and above, you will 
> need to create a separate route for the all-access API endpoints. Earlier 
> versions would register these under the `next-auth` route.

Create your `next-auth-all-access` instance and export it:

```typescript title=app/auth-all-access.ts
import createNextAuthAllAccess from '@takeshape/next-auth-all-access/v5';
import jwks from '../../keys/jwks.json';

export const {
  handlers: { GET },
  withAllAccess
} = createNextAuthAllAccess({
  issuer: 'https://example.com/',
  origin: 'https://example.com/',
  jwks,
  clients: [
    {
      id: 'my-api',
      audience: 'https://my-api.com/posts',
      expiration: '6h',
      // Optional whitelist — `exp` and `iat` will always be included
      allowedClaims: ['email', 'sub'],
      // Optional rename
      renameClaims: {
        foo: 'bar',
      },
    },
  ]
});
```

```typescript title=app/auth.ts
import Auth0Provider from 'next-auth/providers/auth0'
import { withAllAccess } from './auth-all-access';

export const {
  handlers: { GET, POST },
  auth
} = NextAuth(withAllAccess({
  providers: [
    Auth0Provider({
      clientId: process.env.AUTH0_ID,
      clientSecret: process.env.AUTH0_SECRET,
      issuer: process.env.AUTH0_ISSUER,
    }),
  ]
}));
```

```typescript title=app/api/oidc/[...allaccess]/route.ts
export { GET } from '@/lib/auth-all-access';
```

## Client Integration

`NextAuthAllAccess` will add any configured client tokens to the session object
under the `allAccess` property. In the example above your session would contain
properties that look like this:

```json
{
  "allAccess": {
    "my-api": {
      "accessToken": "[ACCESS_TOKEN]"
    }
  }
}
```

The module exports some helpers for accessing those values, you can use like
this:

```typescript
import { getClientToken } from '@takeshape/next-auth-all-access/react'
import { useSession } from 'next-auth/react'

export function MyComponent() {
  const { data: session } = useSession()
  const clientToken = getClientToken({ clientId: 'my-api', session })
  // clientToken === { accessToken: '[ACCESS_TOKEN]' }
  fetch('https://my-api.com/protected/resource', { headers: { authorization: `Bearer ${clientToken}` } })
}
```

There is also a hook, which requires the `next-auth/react` `SessionProvider`. It
will update automatically when the session token changes.

```typescript
import { useAllAccess } from '@takeshape/next-auth-all-access/react'

export function MyComponent() {
  const { isAuthenticated, clientToken } = useAllAccess({ clientId: 'my-api', required: true })
  // isAuthenticated === true
  // clientToken === { accessToken: '[ACCESS_TOKEN]' }
  if (isAuthenticated) {
    fetch('https://my-api.com/protected/resource', { headers: { authorization: `Bearer ${clientToken}` } })
  }
}
```
