import { describe, expect, test } from '~/@/test-runner'
import { exportJWK } from './export-jwk'

describe('exportJWK', () => {
  test('should export an extractable key to JWK format', async () => {
    // Generate a test key that is extractable
    const keyPair = await crypto.subtle.generateKey(
      {
        name: 'RSASSA-PKCS1-v1_5',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256',
      },
      true, // extractable
      ['sign', 'verify'],
    )

    // Test exporting the public key
    const publicJwk = await exportJWK(keyPair.publicKey)
    expect(publicJwk).toBeDefined()
    expect(publicJwk.kty).toEqual('RSA')
    expect(publicJwk.n).toBeDefined() // RSA modulus
    expect(publicJwk.e).toBeDefined() // RSA exponent

    // Test exporting the private key
    const privateJwk = await exportJWK(keyPair.privateKey)
    expect(privateJwk).toBeDefined()
    expect(privateJwk.kty).toEqual('RSA')
    expect(privateJwk.d).toBeDefined() // RSA private exponent
    expect(privateJwk.p).toBeDefined() // RSA first prime factor
    expect(privateJwk.q).toBeDefined() // RSA second prime factor
  })

  // test('should throw an error when trying to export a non-extractable key', async () => {
  //   // Generate a test key that is not extractable
  //   const keyPair = await crypto.subtle.generateKey(
  //     {
  //       name: 'RSASSA-PKCS1-v1_5',
  //       modulusLength: 2048,
  //       publicExponent: new Uint8Array([1, 0, 1]),
  //       hash: 'SHA-256',
  //     },
  //     false, // not extractable
  //     ['sign', 'verify'],
  //   )

  //   // Attempt to export the private key should throw an error
  //   await expect(exportJWK(keyPair.privateKey)).rejects.toThrow('Key is not extractable')
  // })

  test('should export an ECDSA key to JWK format', async () => {
    // Generate an ECDSA key
    const keyPair = await crypto.subtle.generateKey(
      {
        name: 'ECDSA',
        namedCurve: 'P-256',
      },
      true, // extractable
      ['sign', 'verify'],
    )

    // Test exporting the public key
    const publicJwk = await exportJWK(keyPair.publicKey)
    expect(publicJwk).toBeDefined()
    expect(publicJwk.kty).toEqual('EC')
    expect(publicJwk.crv).toEqual('P-256')
    expect(publicJwk.x).toBeDefined() // EC x coordinate
    expect(publicJwk.y).toBeDefined() // EC y coordinate
  })
})
