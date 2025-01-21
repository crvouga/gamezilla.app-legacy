import IoRedis from 'ioredis'
import { SecretString } from '../secrets/secret-string'

export const newRedis = async (redisUrl: SecretString) => {
  const instance = new IoRedis(redisUrl.dangerouslyReadValue())

  instance.on('error', (err) => {
    console.error('Redis error', err)
  })

  await instance.ping()

  return instance
}

export type IRedis = Awaited<ReturnType<typeof newRedis>>
