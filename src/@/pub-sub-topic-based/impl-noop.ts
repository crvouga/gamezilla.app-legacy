import { ITopicBasedPubSub } from './interface'

export type ImplNoop = {
  t: 'noop'
}

const init = (_config: ImplNoop): ITopicBasedPubSub => {
  return {
    async pub(_topic, _msg) {},
    async sub(_topic, _callback) {
      return async () => {}
    },
    async unsub(_topic) {},
  }
}

export const ImplNoop = {
  init,
}
