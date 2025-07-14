import { ITopicBasedPubSub } from './interface'

export type Config = {
  t: 'in-memory'
  subscribersByTopic?: TopicBasedPubSubMap
}

export type TopicBasedPubSubMap = Map<string, Set<(msg: string) => unknown>>

export const TopicBasedPubSub = (config: Config): ITopicBasedPubSub => {
  const subscribersByTopic: TopicBasedPubSubMap = config.subscribersByTopic ?? new Map()
  return {
    async pub(topic, msg) {
      const subs = subscribersByTopic.get(topic) ?? new Set()
      await Promise.all(Array.from(subs).map((sub) => sub(msg)))
    },
    async sub(topic, callback) {
      const subs = subscribersByTopic.get(topic) ?? new Set()
      subs.add(callback)
      subscribersByTopic.set(topic, subs)

      return async () => {
        subs.delete(callback)
      }
    },
    async unsub(topic) {
      subscribersByTopic.delete(topic)
    },
  }
}
