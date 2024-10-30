import { IPubSubTopicBased } from '../pub-sub-topic-based'
import { IPubSub } from './interface'

export type Config = {
  t: 'pub-sub-topic-based'
  topic: string
  pubSubTopicBased: IPubSubTopicBased
}

export const PubSub = (config: Config): IPubSub => {
  return {
    async pub(msg) {
      return config.pubSubTopicBased.pub(config.topic, msg)
    },

    async sub(subscriber) {
      return config.pubSubTopicBased.sub(config.topic, subscriber)
    }
  }
}
