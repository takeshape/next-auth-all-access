import type {JSONWebKeySet, JWK} from 'jose';
import type {SessionContextValue} from 'next-auth/react';

export interface Client {
  id: string;
  audience: string;
  expiration?: string | number;
}

export interface NextAuthAllAccessOptions {
  clients: Client[];
  jwksPath?: string;
  privateKey?: string;
  issuer?: string;
}

export interface HandlerOptions {
  jwks: JSONWebKeySet;
  issuer: string;
  origin: string;
}

export type NextAuthToken = Record<string, unknown>;

export type AllAccessToken = {
  id: string;
  accessToken: string;
};

export type AllAccessSession = SessionContextValue['data'] & {allAccess: Record<string, AllAccessToken>};

export function isJsonWebKeySet(obj: unknown): obj is JSONWebKeySet {
  return Boolean(Array.isArray(obj) && obj.keys && (obj.keys as unknown as JWK[]).every(k => k.kid));
}
