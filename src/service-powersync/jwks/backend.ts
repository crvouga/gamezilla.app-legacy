// https://docs.powersync.com/installation/authentication-setup/custom
import { exportJWK } from '~/@/json-crypto/export-jwk.js'
import { isErr } from '~/@/result/result.js'
import { getKeyPairFromEnv } from '../@/backend/keys/keys.js'

const respond = async (_input: {}): Promise<Response | null> => {
  const keyPair = await getKeyPairFromEnv()

  if (isErr(keyPair)) {
    return new Response(keyPair.error, {
      status: 500,
    })
  }
  const powerSyncPublicKey = keyPair.value.publicKey
  if (!powerSyncPublicKey) {
    return new Response('Public key not found', {
      status: 500,
    })
  }
  if (!(powerSyncPublicKey.key instanceof CryptoKey)) {
    return new Response('Invalid public key format', {
      status: 500,
    })
  }
  const jwk = await exportJWK(powerSyncPublicKey.key)
  const jwkWithMetadata = { ...jwk, alg: powerSyncPublicKey.alg, kid: powerSyncPublicKey.kid, use: 'sig' }
  return new Response(JSON.stringify({ keys: [jwkWithMetadata] }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

export const JwksBackend = {
  respond,
}
