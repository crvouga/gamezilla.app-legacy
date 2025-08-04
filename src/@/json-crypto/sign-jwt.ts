/**
 * A simple JWT signing implementation with no external dependencies
 */

import { KeyLike } from './key-like'

type JWTHeader = {
  alg: string
  typ: string
  kid?: string
}

type JWTPayload = {
  iss?: string
  sub?: string
  aud?: string | string[]
  exp?: number
  nbf?: number
  iat?: number
  jti?: string
  [key: string]: any
}

type JWTState = {
  header: JWTHeader
  payload: JWTPayload
}

export const createJWT = (payload: JWTPayload = {}): JWTState => {
  return {
    header: { alg: 'HS256', typ: 'JWT' },
    payload: { ...payload },
  }
}

export const setProtectedHeader = (state: JWTState, header: Partial<JWTHeader>): JWTState => {
  return {
    ...state,
    header: { ...state.header, ...header },
  }
}

export const setSubject = (state: JWTState, sub: string): JWTState => {
  return {
    ...state,
    payload: { ...state.payload, sub },
  }
}

export const setIssuedAt = (state: JWTState, iat?: number): JWTState => {
  return {
    ...state,
    payload: { ...state.payload, iat: iat ?? Math.floor(Date.now() / 1000) },
  }
}

export const setIssuer = (state: JWTState, iss: string): JWTState => {
  return {
    ...state,
    payload: { ...state.payload, iss },
  }
}

export const setAudience = (state: JWTState, aud: string | string[]): JWTState => {
  return {
    ...state,
    payload: { ...state.payload, aud },
  }
}

export const setExpirationTime = (state: JWTState, exp: string | number): JWTState => {
  let expValue: number

  if (typeof exp === 'string') {
    const now = Math.floor(Date.now() / 1000)
    const match = exp.match(/^(\d+)([smhd])$/)

    if (match && match[1] && match[2]) {
      const value = parseInt(match[1])
      const unit = match[2]

      switch (unit) {
        case 's':
          expValue = now + value
          break
        case 'm':
          expValue = now + value * 60
          break
        case 'h':
          expValue = now + value * 3600
          break
        case 'd':
          expValue = now + value * 86400
          break
        default:
          expValue = now
      }
    } else {
      expValue = Math.floor(new Date(exp).getTime() / 1000)
    }
  } else {
    expValue = exp
  }

  return {
    ...state,
    payload: { ...state.payload, exp: expValue },
  }
}

export const sign = async (state: JWTState, key: KeyLike): Promise<string> => {
  const encodedHeader = base64UrlEncode(JSON.stringify(state.header))
  const encodedPayload = base64UrlEncode(JSON.stringify(state.payload))

  const dataToSign = `${encodedHeader}.${encodedPayload}`

  let signature: string

  if (state.header.alg === 'HS256') {
    signature = await signHS256(dataToSign, key)
  } else if (state.header.alg.startsWith('RS')) {
    // Convert JsonWebKey to CryptoKey if needed
    let cryptoKey: CryptoKey
    if (typeof key === 'object' && key !== null && 'kty' in key) {
      // Import the JWK
      cryptoKey = await crypto.subtle.importKey(
        'jwk',
        key,
        { name: 'RSASSA-PKCS1-v1_5', hash: { name: 'SHA-256' } },
        true,
        ['sign'],
      )
    } else if (key instanceof CryptoKey) {
      cryptoKey = key
    } else {
      throw new Error('RSA signing requires a CryptoKey or JsonWebKey')
    }
    signature = await signRSA(dataToSign, cryptoKey, state.header.alg)
  } else {
    throw new Error(`Unsupported algorithm: ${state.header.alg}`)
  }

  return `${dataToSign}.${signature}`
}

// Helper functions
const base64UrlEncode = (str: string): string => {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
const signHS256 = async (data: string, key: KeyLike): Promise<string> => {
  let cryptoKey: CryptoKey

  if (typeof key === 'string') {
    const encoder = new TextEncoder()
    const keyData = encoder.encode(key)
    cryptoKey = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  } else if (key instanceof ArrayBuffer) {
    cryptoKey = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  } else if ('kty' in key) {
    // Handle JsonWebKey
    const algorithm = { name: 'HMAC', hash: 'SHA-256' }
    cryptoKey = await crypto.subtle.importKey('jwk', key, algorithm, false, ['sign'])
  } else if (key instanceof CryptoKey) {
    cryptoKey = key
  } else {
    throw new Error('Unsupported key type')
  }

  const encoder = new TextEncoder()
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(data))

  return base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)))
}

const signRSA = async (data: string, key: string | Uint8Array | CryptoKey, alg: string): Promise<string> => {
  let cryptoKey: CryptoKey

  if (!(key instanceof CryptoKey)) {
    throw new Error('RSA signing requires a CryptoKey instance')
  } else {
    cryptoKey = key
  }

  const hashAlg = alg === 'RS256' ? 'SHA-256' : alg === 'RS384' ? 'SHA-384' : alg === 'RS512' ? 'SHA-512' : 'SHA-256'

  const encoder = new TextEncoder()
  const signature = await crypto.subtle.sign(
    { name: 'RSASSA-PKCS1-v1_5', hash: { name: hashAlg } },
    cryptoKey,
    encoder.encode(data),
  )

  return base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)))
}
