import { SecretString } from '../secrets/secret-string'

export const REDIS_URL = () => SecretString.of('REDIS_URL', import.meta.env?.REDIS_URL)

export const newRedis = async (redisUrl: SecretString) => {
  // if (typeof window !== 'undefined') {
  //   throw new Error('Redis is not available in the browser')
  // }

  const { default: IoRedis } = await import('ioredis')
  const instance = new IoRedis(redisUrl.dangerouslyReadValue())

  instance.on('error', (err) => {
    console.error('Redis error', err)
  })

  await instance.ping()

  return instance
}

export type IRedis = Awaited<ReturnType<typeof newRedis>>
