import { s } from '~/@/schema'
import { Sub } from '~/@/sub'
import { ClientId } from '../wire/client-id'
import { ClientSessionId } from '../wire/client-session-id'
import { SessionId } from '../wire/session-id'

export type Topic<TParams, TMsg> = {
  params: s.Schema<TParams>
  msg: s.Schema<TMsg>
}

export type ContractBase = {
  [key: string]: Topic<any, any>
}

export type Contract<TTopics extends ContractBase> = TTopics

export type MsgMeta = {
  clientSessionId: ClientSessionId
  sessionId: SessionId
  clientId: ClientId
}

export type ClientNode<T extends ContractBase, K extends keyof T> = {
  publish: (params: s.Infer<T[K]['params']>, msg: s.Infer<T[K]['msg']>) => void
  subscribe: <TMsg>(params: s.Infer<T[K]['params']>, mapper: (msg: s.Infer<T[K]['msg']> & MsgMeta) => TMsg) => Sub<TMsg>
}

export type Client<T extends ContractBase> = {
  [K in keyof T]: ClientNode<T, K>
}

export const initContract = <TTopics extends Record<string, Topic<any, any>>>(endpoints: TTopics): Contract<TTopics> =>
  endpoints
