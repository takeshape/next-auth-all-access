#!/usr/bin/env node
/* eslint-disable no-console */
import { exportJWK, exportPKCS8, generateKeyPair } from 'jose'
import meow from 'meow'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { DEFAULT_ALGORITHM } from '../constants.ts'

const cli = meow(
  `
	Usage
    $ next-auth-all-access <flags>

	Options
    --jwks-path  The path to write your jwks.json file to, defaults to './keys/jwks.json'
    --algorithm  The algorithm to use for your key, defaults to 'RS256'
`,
  {
    allowUnknownFlags: false,
    importMeta: import.meta,
    flags: {
      jwksPath: {
        type: 'string',
        shortFlag: 'p',
        default: './keys/jwks.json',
      },
      algorithm: {
        type: 'string',
        shortFlag: 'a',
        default: DEFAULT_ALGORITHM,
      },
    },
  },
)

function keyToKid(key: string) {
  return crypto.createHash('md5').update(key).digest('hex')
}

async function main({ jwksPath, algorithm }: typeof cli.flags) {
  const { publicKey, privateKey } = await generateKeyPair(algorithm)

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
        alg: algorithm,
        kid: keyToKid(publicJwk.n!),
      },
    ],
  }

  console.log(`
Writing your JWKS file to '${jwksPath}'...
  `)

  fs.mkdirSync(path.dirname(jwksPath), { recursive: true })
  fs.writeFileSync(jwksPath, `${JSON.stringify(jwks, null, 2)}\n`)
}

main(cli.flags)
