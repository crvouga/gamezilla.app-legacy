import { ILogger } from '../logger'
import { ITopicBasedPubSub } from './interface'

export type Config = {
  t: 'nats'
  logger: ILogger
}

export const TopicBasedPubSub = (_config: Config): ITopicBasedPubSub => {
  return {
    async pub(_topic, _msg) {
      throw new Error('not implemented')
    },
    async sub(_topic, _callback) {
      throw new Error('not implemented')
    },
    async unsub(_topic) {
      throw new Error('not implemented')
    },
  }
}
