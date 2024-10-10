import { IPubSub } from './interface'

export type Config = {
  t: 'in-memory'
}

export const PubSub = (_config: Config): IPubSub => {
  const subs = new Set<(msg: string) => void>()

  return {
    async pub(msg) {
      for (const sub of subs) {
        sub(msg)
      }
    },

    async sub(subscriber) {
      subs.add(subscriber)

      return async () => {
        subs.delete(subscriber)
      }
    }
  }
}
