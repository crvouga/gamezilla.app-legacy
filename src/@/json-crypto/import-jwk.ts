export const importJWK = async (jwk: JsonWebKey): Promise<CryptoKey> => {
  const algorithm = getAlgorithm(jwk)
  const keyUsages = getKeyUsages(jwk)

  // Import the JWK
  return await crypto.subtle.importKey(
    'jwk',
    jwk,
    algorithm,
    true, // extractable
    keyUsages,
  )
}

const getKeyUsages = (jwk: JsonWebKey): KeyUsage[] => {
  if (jwk.key_ops && Array.isArray(jwk.key_ops) && jwk.key_ops.length > 0) {
    // Filter to only valid KeyUsage values
    const validKeyOps = jwk.key_ops.filter((op) =>
      ['encrypt', 'decrypt', 'sign', 'verify', 'deriveKey', 'deriveBits', 'wrapKey', 'unwrapKey'].includes(op),
    ) as KeyUsage[]

    if (validKeyOps.length > 0) {
      return validKeyOps
    }
  }

  // Default usages based on key type
  return jwk.d ? ['sign'] : ['verify'] // Private key has 'd', public key doesn't
}

const getAlgorithm = (jwk: JsonWebKey): RsaHashedImportParams | EcKeyImportParams => {
  // Validate required JWK fields
  if (!jwk.kty) {
    throw new Error('JWK is missing required "kty" field')
  }

  switch (jwk.kty) {
    case 'RSA':
      // Validate RSA-specific fields
      if (!jwk.n || !jwk.e) {
        throw new Error('RSA JWK is missing required fields (n, e)')
      }

      // Check if it's an encryption key (RSA-OAEP)
      if (jwk.alg === 'RSA-OAEP') {
        return {
          name: 'RSA-OAEP',
          hash: { name: 'SHA-256' },
        }
      }
      // Default to signature key (RSASSA-PKCS1-v1_5)
      return {
        name: 'RSASSA-PKCS1-v1_5',
        hash: { name: 'SHA-256' },
      }
    case 'EC':
      // Validate EC-specific fields
      if (!jwk.crv || (!jwk.x && !jwk.y)) {
        throw new Error('EC JWK is missing required fields (crv, x, y)')
      }

      return {
        name: 'ECDSA',
        namedCurve: jwk.crv || 'P-256',
      }
    default:
      throw new Error(`Unsupported key type: ${jwk.kty}`)
  }
}
