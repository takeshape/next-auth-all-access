import { DefaultSession } from 'next-auth'
import { AllAccessToken } from './types'

declare module 'next-auth' {
  interface Session extends DefaultSession {
    allAccess: Record<string, AllAccessToken>
  }
}
