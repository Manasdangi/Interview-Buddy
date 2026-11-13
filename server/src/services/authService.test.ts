import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT, type JWTPayload } from 'jose'
import { beforeAll, describe, expect, it } from 'vitest'
import { getRequestUserId, verifyFirebaseIdToken } from './authService.js'

const projectId = 'demo-project'
type SigningKey = Awaited<ReturnType<typeof generateKeyPair>>['privateKey']
let privateKey: SigningKey
let otherPrivateKey: SigningKey
let keys: ReturnType<typeof createLocalJWKSet>

async function sign(claims: JWTPayload, key = privateKey, issuer = `https://securetoken.google.com/${projectId}`, audience = projectId) {
  return new SignJWT(claims)
    .setProtectedHeader({ alg: 'RS256', kid: 'k1' })
    .setIssuer(issuer)
    .setAudience(audience)
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(key)
}

beforeAll(async () => {
  const pair = await generateKeyPair('RS256')
  privateKey = pair.privateKey
  otherPrivateKey = (await generateKeyPair('RS256')).privateKey
  const jwk = { ...(await exportJWK(pair.publicKey)), kid: 'k1', alg: 'RS256', use: 'sig' }
  keys = createLocalJWKSet({ keys: [jwk] })
})

describe('verifyFirebaseIdToken', () => {
  it('returns the uid for a valid Firebase token', async () => {
    const token = await sign({ sub: 'user-123' })
    await expect(verifyFirebaseIdToken(token, { keys, projectId })).resolves.toBe('user-123')
  })

  it('rejects tokens signed with another key, wrong audience, wrong issuer or no subject', async () => {
    await expect(verifyFirebaseIdToken(await sign({ sub: 'u' }, otherPrivateKey), { keys, projectId })).rejects.toMatchObject({ statusCode: 401 })
    await expect(verifyFirebaseIdToken(await sign({ sub: 'u' }, privateKey, undefined, 'other'), { keys, projectId })).rejects.toMatchObject({ statusCode: 401 })
    await expect(verifyFirebaseIdToken(await sign({ sub: 'u' }, privateKey, 'https://evil.example'), { keys, projectId })).rejects.toMatchObject({ statusCode: 401 })
    await expect(verifyFirebaseIdToken(await sign({}), { keys, projectId })).rejects.toMatchObject({ statusCode: 401 })
  })

  it('rejects expired and malformed tokens', async () => {
    const expired = await new SignJWT({ sub: 'u' })
      .setProtectedHeader({ alg: 'RS256', kid: 'k1' })
      .setIssuer(`https://securetoken.google.com/${projectId}`)
      .setAudience(projectId)
      .setIssuedAt(Math.floor(Date.now() / 1000) - 7200)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 3600)
      .sign(privateKey)
    await expect(verifyFirebaseIdToken(expired, { keys, projectId })).rejects.toMatchObject({ statusCode: 401 })
    await expect(verifyFirebaseIdToken('not-a-jwt', { keys, projectId })).rejects.toMatchObject({ statusCode: 401 })
  })

  it('reports a config error when no project id is set', async () => {
    await expect(verifyFirebaseIdToken(await sign({ sub: 'u' }), { keys, projectId: null })).rejects.toMatchObject({ statusCode: 500 })
  })
})

describe('getRequestUserId', () => {
  it('treats requests without a bearer token as guests', async () => {
    await expect(getRequestUserId(undefined)).resolves.toBeNull()
    await expect(getRequestUserId('Basic abc')).resolves.toBeNull()
  })
})
