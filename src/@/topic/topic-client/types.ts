import { s } from '~/@/schema'
import { Sub } from '~/@/sub'
import { ClientId } from '../../wire/client-id'
import { ClientSessionId } from '../../wire/client-session-id'
import { SessionId } from '../../wire/session-id'
import { TopicContractBase } from '../topic-contract'

export type TopicClientData = {
  clientSessionId: ClientSessionId
  sessionId: SessionId
  clientId: ClientId
}

export type TopicClientNode<T extends TopicContractBase, K extends keyof T> = {
  pub: (params: s.Infer<T[K]['params']>, msg: s.Infer<T[K]['msg']>) => void
  sub: <TMsg>(
    params: s.Infer<T[K]['params']>,
    mapper: (msg: s.Infer<T[K]['msg']> & TopicClientData) => TMsg,
  ) => Sub<TMsg>
  subAll: <TMsg>(mapper: (msg: s.Infer<T[K]['msg']> & TopicClientData) => TMsg) => Sub<TMsg>
}

export type ITopicClient<T extends TopicContractBase> = {
  [K in keyof T]: TopicClientNode<T, K>
}
