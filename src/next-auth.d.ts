import type { AllAccessToken } from './lib/types.ts'

declare module '@auth/core/types' {
  interface Session extends DefaultSession {
    allAccess?: Record<string, AllAccessToken>
  }
}
