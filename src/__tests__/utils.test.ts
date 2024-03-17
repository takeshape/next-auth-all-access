import { beforeEach, describe, expect, it } from 'vitest'
import { getOrigin } from '../utils'

describe('getOrigin', () => {
  beforeEach(() => {
    delete process.env['NEXTAUTH_URL']
    delete process.env['VERCEL_URL']
  })

  const userOrigin = 'https://www.example.com'

  it('supports a user origin', () => {
    const origin = getOrigin(userOrigin)
    expect(origin).toEqual(userOrigin)
  })

  it('supports a NEXTAUTH_URL origin', () => {
    process.env['NEXTAUTH_URL'] = userOrigin
    const origin = getOrigin()
    expect(origin).toEqual(userOrigin)
  })

  it('supports a VERCEL_URL origin', () => {
    process.env['VERCEL_URL'] = 'vercel-domain.app'
    const origin = getOrigin()
    expect(origin).toEqual('https://vercel-domain.app')
  })

  it('falls back to a localhost origin', () => {
    const origin = getOrigin()
    expect(origin).toEqual('http://localhost:3000')
  })
})
