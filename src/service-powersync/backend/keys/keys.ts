// https://docs.powersync.com/installation/authentication-setup/custom
import { importJWK } from '~/@/json-crypto/import-jwk.js'
import { KeyLike } from '~/@/json-crypto/key-like'
import { Result } from '~/@/result/index.js'
import { Err, isErr, Ok } from '~/@/result/result.js'
import { keysGenerate } from './keys-generate.js'

type Key = {
  alg: string
  kid: string
  key: KeyLike | Uint8Array<ArrayBufferLike>
}

type KeyPair = {
  privateKey: Key | null
  publicKey: Key | null
}

const keys: KeyPair = {
  privateKey: null,
  publicKey: null,
}

const ensureExists = async () => {
  try {
    if (keys.privateKey) {
      return Ok(null)
    }

    const base64Keys = {
      private: import.meta.env?.POWERSYNC_PRIVATE_KEY,
      public: import.meta.env?.POWERSYNC_PUBLIC_KEY,
    }

    if (!base64Keys.private) {
      console.warn(
        'Private key has not been supplied in import.meta.env?.POWERSYNC_PRIVATE_KEY. A temporary key pair will be generated.',
      )
      const generated = await keysGenerate()
      base64Keys.private = generated.privateBase64
      base64Keys.public = generated.publicBase64
    }

    const decodedPrivateKey = Buffer.from(base64Keys.private, 'base64')
    const powerSyncPrivateKey = JSON.parse(new TextDecoder().decode(decodedPrivateKey))
    keys.privateKey = {
      alg: powerSyncPrivateKey.alg,
      kid: powerSyncPrivateKey.kid,
      key: await importJWK(powerSyncPrivateKey),
    }

    if (!base64Keys.public) {
      return Err('Public key has not been supplied in import.meta.env?.POWERSYNC_PUBLIC_KEY')
    }

    const decodedPublicKey = Buffer.from(base64Keys.public, 'base64')

    keys.publicKey = JSON.parse(new TextDecoder().decode(decodedPublicKey))

    return Ok(null)
  } catch (e) {
    console.error('Error ensuring keys', e)
    return Err(String(e))
  }
}

export const getKeyPair = async (): Promise<Result<string, KeyPair>> => {
  const result = await ensureExists()
  if (isErr(result)) {
    return result
  }
  return Ok(keys)
}
