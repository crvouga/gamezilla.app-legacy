import { IPubSub } from './interface'

export type ImplInMemory = {
  t: 'in-memory'
  subs?: Set<(msg: string) => void>
}

const init = (config: ImplInMemory): IPubSub => {
  const subs = config.subs ?? new Set<(msg: string) => void>()

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
    },
  }
}

export const ImplInMemory = {
  init,
}
