import { describe, expect, it } from 'bun:test'
import { getKeyPair } from './keys'

describe.todo('getKeyPair', () => {
  it('should generate temporary keys when no env vars are provided', async () => {
    const result = await getKeyPair()

    expect(result.t).toBe('ok')
    if (result.t !== 'ok') return

    const keys = result.value
    expect(keys.privateKey).toBeDefined()
    expect(keys.publicKey).toBeDefined()
    expect(keys.privateKey?.alg).toBe('RS256')
    expect(keys.publicKey?.alg).toBe('RS256')
    expect(keys.privateKey?.kid ?? null).toBe(keys.publicKey?.kid ?? null)
  })

  it('should use provided env vars when available', async () => {
    const env = {
      POWERSYNC_PRIVATE_KEY:
        'eyJhbGciOiJSUzI1NiIsImtpZCI6InBvd2Vyc3luYy10ZXN0Iiwia2V5X29wcyI6WyJzaWduIl0sInVzZSI6InNpZyJ9',
      POWERSYNC_PUBLIC_KEY:
        'eyJhbGciOiJSUzI1NiIsImtpZCI6InBvd2Vyc3luYy10ZXN0Iiwia2V5X29wcyI6WyJ2ZXJpZnkiXSwidXNlIjoic2lnIn0=',
    }

    const result = await getKeyPair(env)

    expect(result.t).toBe('ok')
    if (result.t !== 'ok') return

    const keys = result.value
    expect(keys.privateKey).toBeDefined()
    expect(keys.publicKey).toBeDefined()
    expect(keys.privateKey?.alg).toBe('RS256')
    expect(keys.publicKey?.alg).toBe('RS256')
    expect(keys.privateKey?.kid).toBe('powersync-test')
    expect(keys.publicKey?.kid).toBe('powersync-test')
  })

  it('should return error when public key is missing', async () => {
    const env = {
      POWERSYNC_PRIVATE_KEY:
        'eyJhbGciOiJSUzI1NiIsImtpZCI6InBvd2Vyc3luYy10ZXN0Iiwia2V5X29wcyI6WyJzaWduIl0sInVzZSI6InNpZyJ9',
    }

    const result = await getKeyPair(env)

    expect(result.t).toBe('err')
    if (result.t === 'ok') return
    expect(result.error).toBe('Public key has not been supplied in import.meta.env?.POWERSYNC_PUBLIC_KEY')
  })

  it('should return error when invalid keys are provided', async () => {
    const env = {
      POWERSYNC_PRIVATE_KEY: 'invalid-base64',
      POWERSYNC_PUBLIC_KEY: 'invalid-base64',
    }

    const result = await getKeyPair(env)

    expect(result.t).toBe('err')
    if (result.t === 'ok') return
    expect(result.error).toContain('Error ensuring keys')
  })
})
