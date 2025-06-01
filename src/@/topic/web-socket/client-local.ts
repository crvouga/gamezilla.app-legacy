import { ILogger, Logger } from '~/@/logger'
import { s } from '~/@/schema'
import { PubSub, Sub } from '~/@/sub'
import { ClientId } from '../../wire/client-id'
import { ClientSessionId } from '../../wire/client-session-id'
import { SessionId } from '../../wire/session-id'
import { Client, ContractBase, MsgMeta } from '../types'
import { toTopicString } from './shared'

export type Config<TContract extends ContractBase> = {
  t: 'local'
  contract: TContract
  logger: ILogger
}

export const initClient = <TContract extends ContractBase>(config: Config<TContract>): Client<TContract> => {
  const logger = Logger.prefix('client', config.logger)

  const subByTopic = new Map<string, PubSub<any>>()

  const clientProxy = {} as Client<TContract>

  for (const topicNameStr of Object.keys(config.contract)) {
    const topicKey = topicNameStr as keyof TContract

    const topicDef = config.contract[topicKey]

    clientProxy[topicKey] = {
      publish: (params: s.Infer<(typeof topicDef)['params']>, msg: s.Infer<(typeof topicDef)['msg']>) => {
        const topicPathParts = topicNameStr.split('/')
        const topicString = toTopicString(topicPathParts, params)
        const pubsub = subByTopic.get(topicString)

        if (!pubsub) return

        const meta: MsgMeta = {
          clientSessionId: ClientSessionId.generate(),
          sessionId: SessionId.generate(),
          clientId: ClientId.generate(),
        }

        const messageWithMeta = {
          ...(msg as any),
          ...meta,
        } as s.Infer<(typeof topicDef)['msg']> & MsgMeta

        pubsub.pub(messageWithMeta)
      },
      subscribe: <TMsgOut>(
        params: s.Infer<(typeof topicDef)['params']>,
        mapper: (msgWithMeta: s.Infer<(typeof topicDef)['msg']> & MsgMeta) => TMsgOut,
      ): Sub<TMsgOut> => {
        const topicPathParts = topicNameStr.split('/')
        const topicString = toTopicString(topicPathParts, params)

        let pubsub = subByTopic.get(topicString) as PubSub<s.Infer<(typeof topicDef)['msg']> & MsgMeta> | undefined

        if (pubsub) {
          logger.debug(`[local-client] subscribe: reusing existing PubSub for topic=${topicString}`)
        } else {
          logger.debug(`[local-client] subscribe: creating new PubSub for topic=${topicString}`)

          pubsub = Sub.create<s.Infer<(typeof topicDef)['msg']> & MsgMeta>()

          subByTopic.set(topicString, pubsub as PubSub<any>)
        }

        return Sub.map(pubsub, mapper)
      },
    }
  }

  return clientProxy
}
