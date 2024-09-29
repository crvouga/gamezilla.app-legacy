import { RemoteResultInternal, ResultInternal } from './result'
import { parser, remoteResultParser } from './result-parser'
export * from './result'
export type { ResultInternal } from './result'
export * from './result-parser'

export type Result<TError, TValue> = ResultInternal<TError, TValue>

export const Result = {
  parser,
  ...ResultInternal
}

export type RemoteResult<TError, TValue> = RemoteResultInternal<TError, TValue>

export const RemoteResult = {
  parser: remoteResultParser,
  ...RemoteResultInternal
}
