#!/usr/bin/env node
/* eslint-disable no-console */

import crypto from 'crypto';
import fs from 'fs';
import {exportJWK, exportPKCS8, generateKeyPair} from 'jose';
import meow from 'meow';
import path from 'path';

const cli = meow(
  `
	Usage
    $ next-auth-all-access generate-keys <flags>

	Options
    --jwks-path  The path to write your jwks.json file to, defaults to './keys/jwks.json'
`,
  {
    allowUnknownFlags: false,
    importMeta: import.meta,
    input: [
      'generate-keys',
    ],
    flags: {
      jwksPath: {
        type: 'string',
        alias: 'p',
        default: './keys/jwks.json',
      },
    },
  },
);

function keyToKid(key) {
  return crypto.createHash('md5').update(key).digest('hex');
}

async function main(cmd, {jwksPath}) {
  const {publicKey, privateKey} = await generateKeyPair('RS256');

  const privateKeyString = await exportPKCS8(privateKey);
  const privateKeyOneLine = privateKeyString.replace(/\n/g, '\\n');

  console.log(`
Add the following line to your .env file, this is your private key:
`);
  console.log(
    `NEXTAUTHOIDC_PRIVATE_KEY='${privateKeyOneLine}'`,
  );

  const publicJwk = await exportJWK(publicKey);

  const jwks = {
    keys: [
      {
        ...publicJwk,
        use: 'sig',
        alg: 'RS256',
        kid: keyToKid(publicJwk.n),
      },
    ],
  };

  console.log(`
Writing your JWKS file to '${jwksPath}'...
  `);

  fs.mkdirSync(path.dirname(jwksPath), {recursive: true});
  fs.writeFileSync(jwksPath, `${JSON.stringify(jwks, null, 2)}\n`);
}

main(cli.input[0], cli.flags);
