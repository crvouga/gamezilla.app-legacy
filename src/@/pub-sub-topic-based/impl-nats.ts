import { ILogger } from '../logger'
import { ITopicBasedPubSub } from './interface'

export type ImplNats = {
  t: 'nats'
  logger: ILogger
}

const init = (_config: ImplNats): ITopicBasedPubSub => {
  return {
    async pub(_topic, _msg) {
      console.error('not implemented')
    },
    async sub(_topic, _callback) {
      console.error('not implemented')
      return async () => {}
    },
    async unsub(_topic) {
      console.error('not implemented')
    },
  }
}

export const ImplNats = {
  init,
}
