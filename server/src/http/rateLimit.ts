import { HttpError } from '../utils/httpError.js'

type Bucket = {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()
let nextSweepAt = 0

function sweepExpired(now: number) {
  if (now < nextSweepAt) return
  nextSweepAt = now + 60_000
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
}

/**
 * Fixed-window limiter. State is per process, so on serverless it limits each instance
 * separately: a cheap brake on abuse, not a precise global quota.
 */
export function enforceRateLimit(key: string, limit: number, windowMs: number, now = Date.now()) {
  sweepExpired(now)

  const bucket = buckets.get(key)
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return
  }

  if (bucket.count >= limit) {
    throw new HttpError(429, 'Too many requests. Please wait a few minutes and try again.')
  }

  bucket.count += 1
}

export function resetRateLimits() {
  buckets.clear()
  nextSweepAt = 0
}
