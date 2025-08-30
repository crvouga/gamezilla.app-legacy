import { ITopicBasedPubSub } from '../pub-sub-topic-based'
import { IPubSub } from './interface'

export type ImplFromTopicBasedPubSub = {
  t: 'from-topic-based-pub-sub'
  topic: string
  pubSubTopicBased: ITopicBasedPubSub
}

const init = (config: ImplFromTopicBasedPubSub): IPubSub => {
  return {
    async pub(msg) {
      return config.pubSubTopicBased.pub(config.topic, msg)
    },

    async sub(subscriber) {
      return config.pubSubTopicBased.sub(config.topic, subscriber)
    },
  }
}

export const ImplFromTopicBasedPubSub = {
  init,
}
