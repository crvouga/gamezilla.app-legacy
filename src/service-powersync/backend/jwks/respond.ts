// https://docs.powersync.com/installation/authentication-setup/custom
import { isErr } from '~/@/result/result.js'
import { getKeyPair } from '../keys/keys.js'

const respond = async (_input: {}): Promise<Response | null> => {
  const keyPair = await getKeyPair()
  if (isErr(keyPair)) {
    return new Response(keyPair.error, {
      status: 500,
    })
  }
  const powerSyncPublicKey = keyPair.value.publicKey
  return new Response(JSON.stringify({ keys: [powerSyncPublicKey] }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

export const PowerSyncJwks = {
  respond,
}
