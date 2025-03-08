/**
 * Generates a cryptographic key pair using the Web Crypto API
 * @param algo The algorithm to use for key generation ('RSA' or 'ECDSA')
 * @param config Configuration options including extractable flag
 * @returns A Promise that resolves to a CryptoKeyPair
 */
export const generateKeyPair = async (
  algo: 'RSA' | 'ECDSA',
  config: { extractable: boolean },
): Promise<CryptoKeyPair> => {
  const { extractable } = config

  switch (algo) {
    case 'RSA':
      return await crypto.subtle.generateKey(
        {
          name: 'RSASSA-PKCS1-v1_5',
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]), // 65537
          hash: 'SHA-256',
        },
        extractable,
        ['sign', 'verify'],
      )
    case 'ECDSA':
      return await crypto.subtle.generateKey(
        {
          name: 'ECDSA',
          namedCurve: 'P-256',
        },
        extractable,
        ['sign', 'verify'],
      )
    default:
      throw new Error(`Unsupported algorithm: ${algo}`)
  }
}
