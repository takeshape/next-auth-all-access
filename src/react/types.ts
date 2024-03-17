import type { UseSessionOptions } from 'next-auth/lib/client'
import type { SessionContextValue } from 'next-auth/react'
import type { SetOptional } from 'type-fest'

export interface GetClientTokenOptions {
  clientId: string
  session: SessionContextValue['data'] | undefined
}

export interface UseAllAccessOptions extends SetOptional<UseSessionOptions<boolean>, 'required'> {
  clientId: string
}
