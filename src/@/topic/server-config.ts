import type { IHttpServer } from '~/@/http-server/interface'
import { ILogger } from '~/@/logger'
import { ITopicBasedPubSub } from '~/@/pub-sub-topic-based'
import { ClientId } from '~/@/wire/client-id'
import { ClientSessionId } from '~/@/wire/client-session-id'
import { SessionId } from '~/@/wire/session-id'
import { ContractBase } from './topic-contract'
import { TopicMsgCodec } from './topic-msg-codec'

export type BackendWebSocketData = {
  clientId: ClientId
  sessionId: SessionId
  clientSessionId: ClientSessionId
}

export type ServerConfig<TContract extends ContractBase> = {
  t: 'web-sockets'
  contract: TContract
  httpServer: IHttpServer
  logger: ILogger
  endpoint: string
  codec: TopicMsgCodec
  pubSub: ITopicBasedPubSub
}
