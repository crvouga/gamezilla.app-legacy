import { IPubSubTopicBased } from './interface'

export type Config = {
  t: 'in-memory'
}

export const PubSubTopicBased = (_config: Config): IPubSubTopicBased => {
  const subscribesByTopic = new Map<string, Set<(msg: string) => void>>()
  return {
    async pub(topic, msg) {
      const subs = subscribesByTopic.get(topic)
      if (!subs) {
        return
      }
      for (const sub of subs) {
        sub(msg)
      }
      await new Promise((resolve) => setTimeout(resolve, 0))
    },
    async sub(topic, callback) {
      const subs = subscribesByTopic.get(topic) ?? new Set()
      subscribesByTopic.set(topic, subs)
      subs.add(callback)
      await new Promise((resolve) => setTimeout(resolve, 0))
      return async () => {
        subs.delete(callback)
        await new Promise((resolve) => setTimeout(resolve, 0))
      }
    },
    async unsub(topic) {
      subscribesByTopic.delete(topic)
      await new Promise((resolve) => setTimeout(resolve, 0))
    }
  }
}
