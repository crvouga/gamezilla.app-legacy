// https://docs.powersync.com/installation/authentication-setup/custom
import { exportJWK } from '~/@/json-crypto/export-jwk.js'
import { ILogger } from '~/@/logger/interface.js'
import { isErr } from '~/@/result/result.js'
import { getKeyPairFromEnv } from '../@/backend/keys/keys.js'

const respond = async (_input: { req: Request; logger: ILogger }): Promise<Response | null> => {
  const logger = _input.logger.child(['jwks'])
  logger.info('Responding to request', _input.req.url)

  logger.info('Getting key pair from env')
  const keyPair = await getKeyPairFromEnv()

  if (isErr(keyPair)) {
    logger.error('Failed to get key pair:', keyPair.error)
    return new Response(keyPair.error, {
      status: 500,
    })
  }

  const powerSyncPublicKey = keyPair.value.publicKey
  if (!powerSyncPublicKey) {
    logger.error('Public key not found')
    return new Response('Public key not found', {
      status: 500,
    })
  }

  if (!(powerSyncPublicKey.key instanceof CryptoKey)) {
    logger.error('Invalid public key format')
    return new Response('Invalid public key format', {
      status: 500,
    })
  }

  logger.info('Exporting JWK')
  const jwk = await exportJWK(powerSyncPublicKey.key)
  const jwkWithMetadata = { ...jwk, alg: powerSyncPublicKey.alg, kid: powerSyncPublicKey.kid, use: 'sig' }

  logger.info('Successfully generated JWKS response')
  return new Response(JSON.stringify({ keys: [jwkWithMetadata] }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

export const PowerSyncJwksBackend = {
  respond,
}
