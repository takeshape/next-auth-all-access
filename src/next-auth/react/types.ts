import type { SessionContextValue } from 'next-auth/react'
import type { SetOptional } from 'type-fest'
import { AllAccessToken } from '../../types.ts'

export interface UseSessionOptions<R extends boolean> {
  required: R
  /** Defaults to `signIn` */
  onUnauthenticated?: () => void
}

export interface GetClientTokenOptions {
  clientId: string
  session: SessionContextValue['data'] | undefined
}

export interface UseAllAccessOptions extends SetOptional<UseSessionOptions<boolean>, 'required'> {
  clientId: string
}

export type AllAccessSession = SessionContextValue['data'] & {
  allAccess: Record<string, AllAccessToken>
}
