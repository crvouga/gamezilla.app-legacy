// https://docs.powersync.com/installation/authentication-setup/custom
import { importJWK } from '~/@/json-crypto/import-jwk.js'
import { KeyLike } from '~/@/json-crypto/key-like'
import { Result } from '~/@/result/index.js'
import { Err, Ok } from '~/@/result/result.js'
import { CONFIG_BACKEND } from '~/config/backend'

type Key = {
  alg: string
  kid: string
  key: KeyLike | Uint8Array<ArrayBufferLike>
}

type KeyPair = {
  privateKey: Key | null
  publicKey: Key | null
}

export const getKeyPair = async (): Promise<Result<string, KeyPair>> => {
  try {
    const privateKeyBase64 = CONFIG_BACKEND.POWERSYNC_PRIVATE_KEY.dangerouslyReadValue()
    const publicKeyBase64 = CONFIG_BACKEND.POWERSYNC_PUBLIC_KEY

    if (!privateKeyBase64) {
      return Err('POWERSYNC_PRIVATE_KEY environment variable is required')
    }

    if (!publicKeyBase64) {
      return Err('POWERSYNC_PUBLIC_KEY environment variable is required')
    }

    const decodedPrivateKey = Buffer.from(privateKeyBase64, 'base64')
    const powerSyncPrivateKey = JSON.parse(new TextDecoder().decode(decodedPrivateKey))
    const privateKey: Key = {
      alg: powerSyncPrivateKey.alg,
      kid: powerSyncPrivateKey.kid,
      key: await importJWK(powerSyncPrivateKey),
    }

    const decodedPublicKey = Buffer.from(publicKeyBase64, 'base64')
    const powerSyncPublicKey = JSON.parse(new TextDecoder().decode(decodedPublicKey))
    const publicKey: Key = {
      alg: powerSyncPublicKey.alg,
      kid: powerSyncPublicKey.kid,
      key: await importJWK(powerSyncPublicKey),
    }

    return Ok({ privateKey, publicKey })
  } catch (e) {
    console.error('Error loading PowerSync keys:', e)
    return Err(String(e))
  }
}
