import { describe, expect, test } from '~/@/test-runner'
import { importJWK } from './import-jwk'

describe('importJWK', () => {
  test('should import an RSA public key', async () => {
    const publicJwk: JsonWebKey = {
      kty: 'RSA',
      n: 'xwQ72P9z9OYshiQ-ntDYaPnnfwG6u9JAdLMZ5o0dmjlcyrvwQRdoFIKPnO65Q8mh6F_LDSxjxa2Yzo_wdjhbPZLjfUJXgCzm54cClXzT5twzo7lzoAfaJlkTsoZc2HFWqmcri0BuzmTFLZx2Q7wYBm0pXHmQKF0V-C1O6NWfd4mfBhbM-I1tHYSpAMgarSm22WDMDx-WWI7TEzy2QhaBVaENW9BKaKkJklocAZCxk18WhR0fckIGiWiSM5FcU1PY2jfGsTmX505Ub7P5Dz75Ygqrutd5tFrcqyPAtPTFDk8X1InxkkUwpP3nFU5o50DGhwQolGYKPGtQ-ZtmbOfcWQ',
      e: 'AQAB',
      alg: 'RS256',
      // kid: 'test-key-id',
    }

    const cryptoKey = await importJWK(publicJwk)

    expect(cryptoKey).toBeTruthy()
    expect(cryptoKey instanceof CryptoKey).toEqual(true)
    expect(cryptoKey.type).toEqual('public')
    expect(cryptoKey.algorithm.name).toEqual('RSASSA-PKCS1-v1_5')
    expect(cryptoKey.usages.includes('verify')).toEqual(true)
    expect(cryptoKey.extractable).toEqual(true)
  })

  test('should import an RSA private key', async () => {
    const privateJwk: JsonWebKey = {
      kty: 'RSA',
      n: 'xwQ72P9z9OYshiQ-ntDYaPnnfwG6u9JAdLMZ5o0dmjlcyrvwQRdoFIKPnO65Q8mh6F_LDSxjxa2Yzo_wdjhbPZLjfUJXgCzm54cClXzT5twzo7lzoAfaJlkTsoZc2HFWqmcri0BuzmTFLZx2Q7wYBm0pXHmQKF0V-C1O6NWfd4mfBhbM-I1tHYSpAMgarSm22WDMDx-WWI7TEzy2QhaBVaENW9BKaKkJklocAZCxk18WhR0fckIGiWiSM5FcU1PY2jfGsTmX505Ub7P5Dz75Ygqrutd5tFrcqyPAtPTFDk8X1InxkkUwpP3nFU5o50DGhwQolGYKPGtQ-ZtmbOfcWQ',
      e: 'AQAB',
      d: 'DxH9xZVX30BbNQiJc-JZq5Lzd3-ogqsZo1jDsYXRqff_9SYE4xdZ9io2GB7xHYL39ksgZ3mgQDfuNPv9KXlA7xLhr5GNnYGC9t5hS-9yKgqTO7v9pnBWi0pOx7NvjD8luBqoZKdpIbmP-radoo0iHCPELpB7fTZ9nX8MZjO_V5c1YK1Kts8NdnGmQv3_CHlYwfiC2QZW3JyLGnw4rVXGFHwuUSG_JJQrOHzMkPvCYXtGcQTQSfQ5tAxzZAk-dXOQcxkexUvHwZ8_zRrA_Yq4wQQrKHcq7H9CHvJksxHa8nVQyJt8y5qyM1EBw3SqOgRuX7d0cfaY86Y8r1X5wQ',
      p: '9gY2w6I6S6L0juEKsbeDAwpd9WMfgqFoeA9vEyEUuk4kLwBKcoe1x4HG68ik918hdDSE9vDQSccA3xXHOAFOPJ8R9EeIAbTi1VwBYnbTp87X-xcPWlEPkrdoUKW60tgs1aNd_Nnc9LEVVPMS390zbFxt8TN_biaBgelNgbC95sM',
      q: 'ykpao6wkhwvO-xsWAt5l0-osQGphwOFQZCDm_Zb2_3cOE11mPXQxomIQNcR0T9Vy3aTTGWXKdwrnntM-aTxstlLl_VNPIIVMwCW2erVY2Hv46Rl-XSLwGFOebE7YJBkhO-j1S-ZxH_ecYvGLm0w2qGc1WHaqunb9Genc-2-ZBwU',
      dp: 'RqcVOyikCUiUiUCYL09JNPKlBTJi5SMW5afC-dNiHMPnGjQFh-Zy_-m_0Wl0PLkL9dHmN9Y0pEF0XxfyJp2vHlNBSHw-iFMat5P851VS-0Jf6tZiTg3s3m12YiF-9-bDB3yJdNeee7wKK4g1h4X5_ylFPPinCA6bp6qSKxipgM0',
      dq: 'SbH-L2S9LsYLd-sS6nxDaCijJzVUcS7EYqmWQ8CTUQFi-XuYZiz3Vjt-ZiVQAZEj0VKBeCqjP0QVUlkf6JxPwZy6LXhQPwlv2U-Fp7HB4S1XAXb7PJUwE0kBhphZbtWPK8QzdQi2wGxZCR8PcZGxkx_t1I-dDi1-bKVaE7WwfSE',
      qi: 'FZhClBMywVVjnuUud-05qd5CYU0dK79akAgy9oX6RX6I3IIIPckCciRrokxglZn-omAY5CnCe4KdrnjFOT5YUZE7G_Pg44XgCXaarLQf4hl80oPEf6-jJ5Iy6wPRx7G2e8qLxnh9cOdf-kRqgOS3F48Ucvw3ma5dMHzto70',
      alg: 'RS256',
      // kid: 'test-key-id',
    }

    const cryptoKey = await importJWK(privateJwk)

    expect(cryptoKey).toBeTruthy()
    expect(cryptoKey instanceof CryptoKey).toEqual(true)
    expect(cryptoKey.type).toEqual('private')
    expect(cryptoKey.algorithm.name).toEqual('RSASSA-PKCS1-v1_5')
    expect(cryptoKey.usages.includes('sign')).toEqual(true)
    expect(cryptoKey.extractable).toEqual(true)
  })

  test('should import an EC public key', async () => {
    const publicJwk: JsonWebKey = {
      kty: 'EC',
      crv: 'P-256',
      x: 'gI0GAILBdu7T53akrFmMyGcsF3n5dO7MmwNBHKW5SV0',
      y: 'SLW_xSffzlPWrHEVI30DHM_4egVwt3NQqeUD7nMFpps',
      alg: 'ES256',
      // kid: 'test-ec-key',
    }

    const cryptoKey = await importJWK(publicJwk)

    expect(cryptoKey).toBeTruthy()
    expect(cryptoKey instanceof CryptoKey).toEqual(true)
    expect(cryptoKey.type).toEqual('public')
    expect(cryptoKey.algorithm.name).toEqual('ECDSA')
    expect(cryptoKey.usages.includes('verify')).toEqual(true)
    expect(cryptoKey.extractable).toEqual(true)
  })

  test.skip('should use key_ops if provided', async () => {
    const jwk: JsonWebKey = {
      kty: 'RSA',
      n: 'xwQ72P9z9OYshiQ-ntDYaPnnfwG6u9JAdLMZ5o0dmjlcyrvwQRdoFIKPnO65Q8mh6F_LDSxjxa2Yzo_wdjhbPZLjfUJXgCzm54cClXzT5twzo7lzoAfaJlkTsoZc2HFWqmcri0BuzmTFLZx2Q7wYBm0pXHmQKF0V-C1O6NWfd4mfBhbM-I1tHYSpAMgarSm22WDMDx-WWI7TEzy2QhaBVaENW9BKaKkJklocAZCxk18WhR0fckIGiWiSM5FcU1PY2jfGsTmX505Ub7P5Dz75Ygqrutd5tFrcqyPAtPTFDk8X1InxkkUwpP3nFU5o50DGhwQolGYKPGtQ-ZtmbOfcWQ',
      e: 'AQAB',
      key_ops: ['encrypt', 'wrapKey'],
      alg: 'RSA-OAEP',
      // kid: 'test-key-id',
    }

    const cryptoKey = await importJWK(jwk)

    expect(cryptoKey.usages).toEqual(['encrypt', 'wrapKey'])
  })

  // test('should throw error for unsupported key type', async () => {
  //   const invalidJwk: JsonWebKey = {
  //     kty: 'INVALID',
  //     n: 'test',
  //     e: 'AQAB',
  //   }

  //   await expect(importJWK(invalidJwk)).rejects.toThrow('Unsupported key type: INVALID')
  // })
})
