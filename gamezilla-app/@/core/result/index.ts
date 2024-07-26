import { RemoteResultPrivate, ResultPrivate } from './result'
import { parser, remoteResultParser } from './result-parser'
export * from './result'
export type { ResultPrivate } from './result'
export * from './result-parser'

export type Result<TError, TValue> = ResultPrivate<TError, TValue>

export const Result = {
  parser,
  ...ResultPrivate
}

export type RemoteResult<TError, TValue> = RemoteResultPrivate<TError, TValue>

export const RemoteResult = {
  parser: remoteResultParser,
  ...RemoteResultPrivate
}
