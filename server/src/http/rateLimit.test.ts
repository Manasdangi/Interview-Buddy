import { beforeEach, describe, expect, it } from 'vitest'
import { enforceRateLimit, resetRateLimits } from './rateLimit.js'

describe('enforceRateLimit', () => {
  beforeEach(() => resetRateLimits())

  it('allows requests up to the limit, then rejects with 429', () => {
    enforceRateLimit('k', 2, 1000, 0)
    enforceRateLimit('k', 2, 1000, 10)
    expect(() => enforceRateLimit('k', 2, 1000, 20)).toThrow(expect.objectContaining({ statusCode: 429 }))
  })

  it('resets after the window and tracks keys separately', () => {
    enforceRateLimit('a', 1, 1000, 0)
    expect(() => enforceRateLimit('b', 1, 1000, 0)).not.toThrow()
    expect(() => enforceRateLimit('a', 1, 1000, 1000)).not.toThrow()
  })
})
