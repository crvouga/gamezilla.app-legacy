import { IHttpClient } from '~/@/http-client'
import { Result } from '~/@/result'
import { s } from '~/@/schema'
import { ClientSessionId } from '../wire/client-session-id'
import { SessionId } from '../wire/session-id'
import { RPCError } from './error'

export type Base = Contract<Record<string, Endpoint<any, any>>>

export type Endpoint<TInput, TOutput> = {
  input: s.Parser<TInput>
  output: s.Parser<TOutput>
}

export type ReqCtx = {
  sessionId: SessionId
  clientSessionId: ClientSessionId
}

export type Contract<TEndpoints extends Record<string, Endpoint<any, any> | Contract<any>>> = TEndpoints

export type Client<T extends Base> = {
  [K in keyof T]: (input: s.Infer<T[K]['input']>) => Promise<Result<RPCError, s.Infer<T[K]['output']>>>
}

export type Server<T extends Base> = {
  [K in keyof T]: (input: s.Infer<T[K]['input']>, reqCtx: ReqCtx) => Promise<s.Infer<T[K]['output']>>
}

export const initContract = <TEndpoints extends Record<string, Endpoint<any, any> | Contract<any>>>(
  endpoints: TEndpoints,
): Contract<TEndpoints> => endpoints

export type ClientConfigHttp<T extends Base> = {
  t: 'http'
  serverUrl: string
  clientSessionId: ClientSessionId
  httpClient: IHttpClient
  contract: T
}

export type ClientConfigLocal<T extends Base> = {
  t: 'local'
  clientSessionId: ClientSessionId
  sessionId: SessionId
  server: Server<T>
  contract: T
}

export type ClientConfig<T extends Base> = ClientConfigHttp<T> | ClientConfigLocal<T>
