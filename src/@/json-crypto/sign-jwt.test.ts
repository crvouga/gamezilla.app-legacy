import { describe, test, expect } from 'vitest'
import * as SignJWT from './sign-jwt'

describe('SignJWT', () => {
  describe('createJWT', () => {
    test('should create a JWT with default values', () => {
      const jwt = SignJWT.createJWT()
      expect(jwt.header).toEqual({ alg: 'HS256', typ: 'JWT' })
      expect(jwt.payload).toEqual({})
    })

    test('should create a JWT with provided payload', () => {
      const payload = { foo: 'bar' }
      const jwt = SignJWT.createJWT(payload)
      expect(jwt.header).toEqual({ alg: 'HS256', typ: 'JWT' })
      expect(jwt.payload).toEqual(payload)
    })
  })

  describe('setProtectedHeader', () => {
    test('should update the header', () => {
      const jwt = SignJWT.createJWT()
      const updated = SignJWT.setProtectedHeader(jwt, { kid: 'test-key' })
      expect(updated.header).toEqual({ alg: 'HS256', typ: 'JWT', kid: 'test-key' })
    })
  })

  describe('setSubject', () => {
    test('should set the subject claim', () => {
      const jwt = SignJWT.createJWT()
      const updated = SignJWT.setSubject(jwt, 'user123')
      expect(updated.payload.sub).toBe('user123')
    })
  })

  describe('setIssuedAt', () => {
    test('should set the issued at claim with current time when no value provided', () => {
      const jwt = SignJWT.createJWT()
      const before = Math.floor(Date.now() / 1000)
      const updated = SignJWT.setIssuedAt(jwt)
      const after = Math.floor(Date.now() / 1000)
      expect(updated.payload.iat).toBeGreaterThanOrEqual(before)
      expect(updated.payload.iat).toBeLessThanOrEqual(after)
    })

    test('should set the issued at claim with provided value', () => {
      const jwt = SignJWT.createJWT()
      const iat = 1234567890
      const updated = SignJWT.setIssuedAt(jwt, iat)
      expect(updated.payload.iat).toBe(iat)
    })
  })

  describe('setIssuer', () => {
    test('should set the issuer claim', () => {
      const jwt = SignJWT.createJWT()
      const updated = SignJWT.setIssuer(jwt, 'https://example.com')
      expect(updated.payload.iss).toBe('https://example.com')
    })
  })

  describe('setAudience', () => {
    test('should set the audience claim with a string', () => {
      const jwt = SignJWT.createJWT()
      const updated = SignJWT.setAudience(jwt, 'api:access')
      expect(updated.payload.aud).toBe('api:access')
    })

    test('should set the audience claim with an array', () => {
      const jwt = SignJWT.createJWT()
      const audiences = ['api:access', 'api:admin']
      const updated = SignJWT.setAudience(jwt, audiences)
      expect(updated.payload.aud).toEqual(audiences)
    })
  })

  describe('setExpirationTime', () => {
    test('should set expiration time with a number', () => {
      const jwt = SignJWT.createJWT()
      const exp = 1234567890
      const updated = SignJWT.setExpirationTime(jwt, exp)
      expect(updated.payload.exp).toBe(exp)
    })

    test('should set expiration time with a duration string (seconds)', () => {
      const jwt = SignJWT.createJWT()
      const now = Math.floor(Date.now() / 1000)
      const updated = SignJWT.setExpirationTime(jwt, '30s')
      expect(updated.payload.exp).toBeCloseTo(now + 30, 0)
    })

    test('should set expiration time with a duration string (minutes)', () => {
      const jwt = SignJWT.createJWT()
      const now = Math.floor(Date.now() / 1000)
      const updated = SignJWT.setExpirationTime(jwt, '5m')
      expect(updated.payload.exp).toBeCloseTo(now + 5 * 60, 0)
    })

    test('should set expiration time with a duration string (hours)', () => {
      const jwt = SignJWT.createJWT()
      const now = Math.floor(Date.now() / 1000)
      const updated = SignJWT.setExpirationTime(jwt, '2h')
      expect(updated.payload.exp).toBeCloseTo(now + 2 * 3600, 0)
    })

    test('should set expiration time with a duration string (days)', () => {
      const jwt = SignJWT.createJWT()
      const now = Math.floor(Date.now() / 1000)
      const updated = SignJWT.setExpirationTime(jwt, '1d')
      expect(updated.payload.exp).toBeCloseTo(now + 86400, 0)
    })
  })

  describe('sign', () => {
    test('should sign a JWT with HS256 algorithm using a string key', async () => {
      const jwt = SignJWT.createJWT({ sub: 'test' })
      const token = await SignJWT.sign(jwt, 'secret')
      expect(typeof token).toBe('string')
      expect(token.split('.').length).toBe(3)
    })

    test('should throw an error for unsupported algorithms', async () => {
      const jwt = SignJWT.createJWT({ sub: 'test' })
      const jwtWithUnsupportedAlg = SignJWT.setProtectedHeader(jwt, { alg: 'UNSUPPORTED' })
      await expect(SignJWT.sign(jwtWithUnsupportedAlg, 'secret')).rejects.toThrow('Unsupported algorithm')
    })
  })

  describe('chaining methods', () => {
    test('should support method chaining for building a complete JWT', async () => {
      const now = Math.floor(Date.now() / 1000)
      let jwt = SignJWT.createJWT()
      jwt = SignJWT.setSubject(jwt, 'user123')
      jwt = SignJWT.setIssuer(jwt, 'https://example.com')
      jwt = SignJWT.setAudience(jwt, 'api:access')
      jwt = SignJWT.setIssuedAt(jwt)
      jwt = SignJWT.setExpirationTime(jwt, '1h')

      expect(jwt.payload.sub).toBe('user123')
      expect(jwt.payload.iss).toBe('https://example.com')
      expect(jwt.payload.aud).toBe('api:access')
      expect(jwt.payload.iat).toBeGreaterThanOrEqual(now)
      expect(jwt.payload.exp).toBeGreaterThan(now)
    })
  })
})
