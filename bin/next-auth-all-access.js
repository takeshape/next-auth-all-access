#!/usr/bin/env node
/* eslint-disable no-console */

import { exportJWK, exportPKCS8, generateKeyPair } from 'jose'
import meow from 'meow'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

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
    input: ['generate-keys'],
    flags: {
      jwksPath: {
        type: 'string',
        shortFlag: 'p',
        default: './keys/jwks.json',
      },
    },
  },
)

function keyToKid(key) {
  return crypto.createHash('md5').update(key).digest('hex')
}

async function main(cmd, { jwksPath }) {
  const { publicKey, privateKey } = await generateKeyPair('RS256')

  const privateKeyString = await exportPKCS8(privateKey)
  const privateKeyOneLine = privateKeyString.replace(/\n/g, '\\n')

  console.log(`
Here is your unaltered private key. This can be pasted directly into your Vercel
environment settings.
`)

  console.log(privateKeyString)

  console.log(`
The following line contains your private key as a single-line string with 
variable assignment. This is suitable for pasting into a local .env file.

ALLACCESS_PRIVATE_KEY='${privateKeyOneLine}'
`)

  const publicJwk = await exportJWK(publicKey)

  const jwks = {
    keys: [
      {
        ...publicJwk,
        use: 'sig',
        alg: 'RS256',
        kid: keyToKid(publicJwk.n),
      },
    ],
  }

  console.log(`
Writing your JWKS file to '${jwksPath}'...
  `)

  fs.mkdirSync(path.dirname(jwksPath), { recursive: true })
  fs.writeFileSync(jwksPath, `${JSON.stringify(jwks, null, 2)}\n`)
}

main(cli.input[0], cli.flags)
