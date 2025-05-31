import { s } from '~/@/schema'
import { Sub } from '~/@/sub'
import { ClientId } from '../wire/client-id'
import { ClientSessionId } from '../wire/client-session-id'
import { SessionId } from '../wire/session-id'

export type Topic<TParams, TMsg> = {
  params: s.Parser<TParams>
  msg: s.Parser<TMsg>
}

export type Contract<TTopics extends Record<string, Topic<any, any> | Contract<any>>> = TTopics

export type Client<T extends Contract<any>> = {
  [K in keyof T]: T[K] extends Topic<unknown, unknown>
    ? {
        publish: (params: s.Infer<T[K]['params']>, msg: s.Infer<T[K]['msg']>) => void
        subscribe: <TMsg>(params: s.Infer<T[K]['params']>, mapper: (msg: s.Infer<T[K]['msg']>) => TMsg) => Sub<TMsg>
      }
    : T[K] extends Contract<any>
      ? Client<T[K]>
      : never
}

export type MsgMeta = {
  clientSessionId: ClientSessionId
  sessionId: SessionId
  clientId: ClientId
}

export type Server<T extends Contract<any>> = {
  [K in keyof T]: T[K] extends Topic<unknown, unknown>
    ? {
        publish: (params: s.Infer<T[K]['params']>, msg: s.Infer<T[K]['msg']>) => void
        subscribe: <TMsg>(
          params: s.Infer<T[K]['params']>,
          mapper: (msg: s.Infer<T[K]['msg']>, meta: MsgMeta) => TMsg,
        ) => Sub<TMsg>
      }
    : T[K] extends Contract<any>
      ? Client<T[K]>
      : never
}

export const initContract = <TTopics extends Record<string, Topic<any, any> | Contract<any>>>(
  endpoints: TTopics,
): Contract<TTopics> => endpoints
