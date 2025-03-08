/**
 * Exports a key to JSON Web Key (JWK) format
 * @param key The CryptoKey to export
 * @returns A Promise that resolves to the JWK representation of the key
 */
export const exportJWK = async (key: CryptoKey): Promise<JsonWebKey> => {
  if (!key.extractable) {
    throw new Error('Key is not extractable')
  }

  return await crypto.subtle.exportKey('jwk', key)
}
