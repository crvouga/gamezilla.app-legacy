import * as crypto from 'crypto'
import { exportJWK } from '~/@/json-crypto/export-jwk'
import { generateKeyPair } from '~/@/json-crypto/generate-key-pair'

export const keysGenerate = async () => {
  const alg = 'RSA'
  const kid = `powersync-${crypto.randomBytes(5).toString('hex')}`

  const { publicKey, privateKey } = await generateKeyPair(alg, {
    extractable: true,
  })

  const privateJwk = {
    ...(await exportJWK(privateKey)),
    alg,
    kid,
  }
  const publicJwk = {
    ...(await exportJWK(publicKey)),
    alg,
    kid,
  }

  const privateBase64 = Buffer.from(JSON.stringify(privateJwk)).toString('base64')
  const publicBase64 = Buffer.from(JSON.stringify(publicJwk)).toString('base64')

  return {
    privateBase64,
    publicBase64,
  }
}
