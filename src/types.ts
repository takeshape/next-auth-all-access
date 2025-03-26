import type { JSONWebKeySet } from 'jose'

export interface Client {
  id: string
  audience: string
  expiration?: string | number
  allowedClaims?: string[]
  renameClaims?: Record<string, string>
}

export interface NextAuthAllAccessOptions {
  clients: Client[]
  jwksPath?: string
  jwks?: unknown
  privateKey?: string
  issuer?: string
  origin?: string
  jwksUriBaseUrl?: string
}

export interface HandlerOptions {
  jwks: JSONWebKeySet
  jwksUriBaseUrl: string
  issuer: string
  origin: string
}

export type AuthToken = Record<string, unknown>

export type AllAccessToken = {
  id: string
  accessToken: string
}
