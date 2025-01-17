// https://docs.powersync.com/installation/authentication-setup/custom
import { getKeys } from '../keys/keys.js'

const respond = async (_input: {}): Promise<Response | null> => {
  const keys = await getKeys()
  const powerSyncPublicKey = keys.publicKey
  return new Response(JSON.stringify({ keys: [powerSyncPublicKey] }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

export const PowerSyncJwks = {
  respond,
}
