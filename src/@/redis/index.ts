import IoRedis from 'ioredis'

export const newRedis = (redisUrl: string) => {
  return new IoRedis(redisUrl)
}

export type IRedis = ReturnType<typeof newRedis>
