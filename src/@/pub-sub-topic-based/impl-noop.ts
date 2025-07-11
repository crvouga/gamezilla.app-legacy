import { ITopicBasedPubSub } from './interface'

export type Config = {
  t: 'noop'
}

export const TopicBasedPubSub = (_config: Config): ITopicBasedPubSub => {
  return {
    async pub(_topic, _msg) {},
    async sub(_topic, _callback) {
      return async () => {}
    },
    async unsub(_topic) {},
  }
}
