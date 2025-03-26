import type { JWK } from 'jose'
import { SetRequired } from 'type-fest'

export interface Client {
  id: string
  audience: string
  expiration?: string | number
  allowedClaims?: string[]
  renameClaims?: Record<string, string>
}

export interface NextAuthAllAccessOptions {
  clients: Client[]
  jwks: unknown
  privateKey?: string
  issuer?: string
  origin?: string
  jwksUriBaseUrl?: string
}

export type NonEmptyArray<T> = T[] & { 0: T }

export type JWKS = {
  keys: NonEmptyArray<SetRequired<JWK, 'kid'>>
}
export interface HandlerOptions {
  jwks: JWKS
  jwksUriBaseUrl: string
  issuer: string
  origin: string
}

export type AuthToken = Record<string, unknown>

export type AllAccessToken = {
  id: string
  accessToken: string
}
