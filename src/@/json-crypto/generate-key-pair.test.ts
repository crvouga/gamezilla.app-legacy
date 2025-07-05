import { describe, test, expect } from '~/@/test-runner'
import { generateKeyPair } from './generate-key-pair'

describe('generateKeyPair', () => {
  test('should generate an RSA key pair with extractable keys', async () => {
    const keyPair = await generateKeyPair('RSA', { extractable: true })

    // Verify the key pair was generated
    expect(keyPair).toBeTruthy()
    expect(keyPair.publicKey).toBeTruthy()
    expect(keyPair.privateKey).toBeTruthy()

    // Verify key properties
    expect(keyPair.publicKey.type).toEqual('public')
    expect(keyPair.privateKey.type).toEqual('private')
    expect(keyPair.publicKey.algorithm.name).toEqual('RSASSA-PKCS1-v1_5')
    expect(keyPair.privateKey.algorithm.name).toEqual('RSASSA-PKCS1-v1_5')
    expect(keyPair.publicKey.extractable).toEqual(true)
    expect(keyPair.privateKey.extractable).toEqual(true)

    // Verify key usages
    expect(keyPair.publicKey.usages.includes('verify')).toEqual(true)
    expect(keyPair.privateKey.usages.includes('sign')).toEqual(true)
  })

  test.skip('should generate an RSA key pair with non-extractable keys', async () => {
    const keyPair = await generateKeyPair('RSA', { extractable: false })

    // Verify the key pair was generated
    expect(keyPair).toBeTruthy()
    expect(keyPair.publicKey).toBeTruthy()
    expect(keyPair.privateKey).toBeTruthy()

    // Verify extractable property
    expect(keyPair.publicKey.extractable).toEqual(false)
    expect(keyPair.privateKey.extractable).toEqual(false)
  })

  test('should generate an ECDSA key pair', async () => {
    const keyPair = await generateKeyPair('ECDSA', { extractable: true })

    // Verify the key pair was generated
    expect(keyPair).toBeTruthy()
    expect(keyPair.publicKey).toBeTruthy()
    expect(keyPair.privateKey).toBeTruthy()

    // Verify key properties
    expect(keyPair.publicKey.type).toEqual('public')
    expect(keyPair.privateKey.type).toEqual('private')
    expect(keyPair.publicKey.algorithm.name).toEqual('ECDSA')
    expect(keyPair.privateKey.algorithm.name).toEqual('ECDSA')

    // Verify key usages
    expect(keyPair.publicKey.usages.includes('verify')).toEqual(true)
    expect(keyPair.privateKey.usages.includes('sign')).toEqual(true)
  })

  // test('should throw an error for unsupported algorithms', async () => {
  //   // @ts-expect-error Testing invalid algorithm
  //   await expect(generateKeyPair('INVALID_ALGO', { extractable: true })).rejects.toThrow(
  //     'Unsupported algorithm: INVALID_ALGO',
  //   )
  // })
})
