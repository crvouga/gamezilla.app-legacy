// https://docs.powersync.com/installation/authentication-setup/custom
import { KeyLike, importJWK } from 'jose'
import { generateKeyPair } from './keys-generate.js'

type Key = {
  alg: string
  kid: string
  key: KeyLike | Uint8Array<ArrayBufferLike>
}

const keys: {
  privateKey: Key | null
  publicKey: Key | null
} = {
  privateKey: null,
  publicKey: null,
}

const ensureKeys = async () => {
  if (keys.privateKey) {
    return
  }

  const base64Keys = {
    private: import.meta.env?.POWERSYNC_PRIVATE_KEY,
    public: import.meta.env?.POWERSYNC_PUBLIC_KEY,
  }

  if (!base64Keys.private) {
    console.warn(
      'Private key has not been supplied in import.meta.env?.POWERSYNC_PRIVATE_KEY. A temporary key pair will be generated.',
    )
    const generated = await generateKeyPair()
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
    throw new Error('Public key has not been supplied in import.meta.env?.POWERSYNC_PUBLIC_KEY')
  }

  const decodedPublicKey = Buffer.from(base64Keys.public, 'base64')

  keys.publicKey = JSON.parse(new TextDecoder().decode(decodedPublicKey))
}

export const getKeys = async () => {
  await ensureKeys()
  return keys
}
