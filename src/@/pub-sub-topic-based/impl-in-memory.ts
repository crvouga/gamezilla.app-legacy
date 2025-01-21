import { IPubSubTopicBased } from './interface'

export type Config = {
  t: 'in-memory'
  subscribersByTopic: PubSubTopicBasedMap
}

export type PubSubTopicBasedMap = Map<string, Set<(msg: string) => void>>

export const PubSubTopicBased = (config: Config): IPubSubTopicBased => {
  return {
    async pub(topic, msg) {
      const subs = config.subscribersByTopic.get(topic)
      if (!subs) {
        return
      }
      for (const sub of subs) {
        sub(msg)
      }
      await new Promise((resolve) => setTimeout(resolve, 0))
    },
    async sub(topic, callback) {
      const subs = config.subscribersByTopic.get(topic) ?? new Set()
      config.subscribersByTopic.set(topic, subs)
      subs.add(callback)
      await new Promise((resolve) => setTimeout(resolve, 0))
      return async () => {
        subs.delete(callback)
        await new Promise((resolve) => setTimeout(resolve, 0))
      }
    },
    async unsub(topic) {
      config.subscribersByTopic.delete(topic)
      await new Promise((resolve) => setTimeout(resolve, 0))
    },
  }
}
