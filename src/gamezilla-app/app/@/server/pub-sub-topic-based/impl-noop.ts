import { IPubSubTopicBased } from './interface'

export type Config = {
  t: 'noop'
}

export const PubSubTopicBased = (_config: Config): IPubSubTopicBased => {
  return {
    async pub(_topic, _msg) {},
    async sub(_topic, _callback) {
      return async () => {}
    },
    async unsub(_topic) {}
  }
}
