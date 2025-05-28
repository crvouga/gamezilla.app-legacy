import { RemoteResultInternal, ResultInternal } from './result'
import { schema, remoteResultParser } from './result-schema'
export * from './result'
export type { ResultInternal } from './result'
export * from './result-schema'

export type Result<TError, TValue> = ResultInternal<TError, TValue>

export const Result = {
  schema,
  ...ResultInternal,
}

export type RemoteResult<TError, TValue> = RemoteResultInternal<TError, TValue>

export const RemoteResult = {
  schema: remoteResultParser,
  ...RemoteResultInternal,
}
