import { sleep } from '../promise/sleep'
import { TimeSpan } from '../time/time-span'
import { ITopicBasedPubSub } from './interface'

export type Config = {
  t: 'in-memory'
  subscribersByTopic?: TopicBasedPubSubMap
}

export type TopicBasedPubSubMap = Map<string, Set<(msg: string) => void>>

export const TopicBasedPubSub = (config: Config): ITopicBasedPubSub => {
  const subscribersByTopic = config.subscribersByTopic ?? new Map()
  return {
    async pub(topic, msg) {
      const subs = subscribersByTopic.get(topic)
      for (const sub of subs) {
        sub(msg)
      }
      await sleep(TimeSpan.milliseconds(0))
    },
    async sub(topic, callback) {
      const subs = subscribersByTopic.get(topic) ?? new Set()
      subscribersByTopic.set(topic, subs)
      await sleep(TimeSpan.milliseconds(0))
      return async () => {
        subs.delete(callback)
        await sleep(TimeSpan.milliseconds(0))
      }
    },
    async unsub(topic) {
      subscribersByTopic.delete(topic)
    },
  }
}
