import { Parser } from 'gamezilla-app/@/core/parser/parser'
import { IPubSubTopicBased } from './interface'

export type Config<T> = {
  t: 'in-memory'
  parser: Parser<T>
}

export const PubSubTopicBased = <TMsg>(_config: Config<TMsg>): IPubSubTopicBased<TMsg> => {
  const subscribesByTopic = new Map<string, Set<(msg: TMsg) => void>>()
  return {
    async pub(topic, msg) {
      const subs = subscribesByTopic.get(topic)
      if (!subs) {
        return
      }
      for (const sub of subs) {
        sub(msg)
      }
    },
    async sub(topic, callback) {
      const subs = subscribesByTopic.get(topic) ?? new Set()
      subscribesByTopic.set(topic, subs)
      subs.add(callback)
      return async () => {
        subs.delete(callback)
      }
    },
    async unsub(topic) {
      subscribesByTopic.delete(topic)
    }
  }
}
