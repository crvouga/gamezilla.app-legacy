import { ILogger } from '../logger'
import { ITopicBasedPubSub } from './interface'

export type ImplNats = {
  t: 'nats'
  logger: ILogger
}

const init = (_config: ImplNats): ITopicBasedPubSub => {
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

export const ImplNats = {
  init,
}
