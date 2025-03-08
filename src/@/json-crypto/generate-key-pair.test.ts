import { describe, it, expect } from 'bun:test'
import { generateKeyPair } from './generate-key-pair'

describe('generateKeyPair', () => {
  it('should generate an RSA key pair with extractable keys', async () => {
    const keyPair = await generateKeyPair('RSA', { extractable: true })

    // Verify the key pair was generated
    expect(keyPair).toBeDefined()
    expect(keyPair.publicKey).toBeDefined()
    expect(keyPair.privateKey).toBeDefined()

    // Verify key properties
    expect(keyPair.publicKey.type).toBe('public')
    expect(keyPair.privateKey.type).toBe('private')
    expect(keyPair.publicKey.algorithm.name).toBe('RSASSA-PKCS1-v1_5')
    expect(keyPair.privateKey.algorithm.name).toBe('RSASSA-PKCS1-v1_5')
    expect(keyPair.publicKey.extractable).toBe(true)
    expect(keyPair.privateKey.extractable).toBe(true)

    // Verify key usages
    expect(keyPair.publicKey.usages).toContain('verify')
    expect(keyPair.privateKey.usages).toContain('sign')
  })

  it.todo('should generate an RSA key pair with non-extractable keys', async () => {
    const keyPair = await generateKeyPair('RSA', { extractable: false })

    // Verify the key pair was generated
    expect(keyPair).toBeDefined()
    expect(keyPair.publicKey).toBeDefined()
    expect(keyPair.privateKey).toBeDefined()

    // Verify extractable property
    expect(keyPair.publicKey.extractable).toBe(false)
    expect(keyPair.privateKey.extractable).toBe(false)
  })

  it('should generate an ECDSA key pair', async () => {
    const keyPair = await generateKeyPair('ECDSA', { extractable: true })

    // Verify the key pair was generated
    expect(keyPair).toBeDefined()
    expect(keyPair.publicKey).toBeDefined()
    expect(keyPair.privateKey).toBeDefined()

    // Verify key properties
    expect(keyPair.publicKey.type).toBe('public')
    expect(keyPair.privateKey.type).toBe('private')
    expect(keyPair.publicKey.algorithm.name).toBe('ECDSA')
    expect(keyPair.privateKey.algorithm.name).toBe('ECDSA')

    // Verify key usages
    expect(keyPair.publicKey.usages).toContain('verify')
    expect(keyPair.privateKey.usages).toContain('sign')
  })

  it('should throw an error for unsupported algorithms', async () => {
    // @ts-expect-error Testing invalid algorithm
    await expect(generateKeyPair('INVALID_ALGO', { extractable: true })).rejects.toThrow(
      'Unsupported algorithm: INVALID_ALGO',
    )
  })
})
