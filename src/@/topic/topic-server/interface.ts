import type { IWebSocketConnection } from '~/@/http-server/interface'
import { s } from '~/@/schema'
import { ClientId } from '~/@/wire/client-id'
import { TopicClientData } from '../topic-client/interface'
import { TopicContractBase } from '../topic-contract'
import { TopicNameSubscription } from '../topic-name-subscription'
import { TopicName, TopicString } from '../topic-string'
import { TopicSubscription } from '../topic-subscription'
import { ToClientMsgMany } from '../web-socket-msgs'

export type ServerSubscription = {
  clients: Set<ClientId | undefined>
}

export type ITopicServer<TContract extends TopicContractBase> = {
  _subscriptionsByTopic: Map<TopicString, TopicSubscription & ServerSubscription>
  _subscriptionsByTopicName: Map<TopicName, TopicNameSubscription & ServerSubscription>
  _clients: Map<ClientId, TopicClientData>
  isSubscribed: <TTopicName extends keyof TContract>(
    topicName: TTopicName,
    topicParams: s.Infer<TContract[TTopicName]['params']>,
    match: (client: TopicClientData) => boolean,
  ) => boolean
  publishTopicName: (
    topicName: TopicName,
    encodedMsg: string | Buffer,
    decodedMsg: ToClientMsgMany,
    sourceConnection: IWebSocketConnection<TopicClientData> | null,
  ) => void
  publishTopic: (
    topic: TopicString,
    encodedMsg: string | Buffer,
    decodedMsg: ToClientMsgMany,
    sourceConnection: IWebSocketConnection<TopicClientData> | null,
  ) => void
}
