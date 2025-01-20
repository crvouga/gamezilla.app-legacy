import IoRedis from 'ioredis'
import { SecretString } from '../secrets/secret-string'

export const newRedis = (redisUrl: SecretString) => {
  return new IoRedis(redisUrl.dangerouslyReadValue())
}

export type IRedis = ReturnType<typeof newRedis>
