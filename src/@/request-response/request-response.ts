import { Err, Ok, type Loading, type NotAsked, type Result } from '../result'
import { Sub } from '../program/sub'
import { Posix } from '../time/posix'
import { Time } from '../time/time'
import { TimeSpan } from '../time/time-span'
import { Uuid } from '../uuid/uuid'

//
//
//
//
//
//
//

export type Requesting = Loading & {
  requestedAt: Posix
  lifeSpan: TimeSpan
  requestId: string
}

export type RequestTimedOut = {
  t: 'request-failed'
  reason: 'timed-out'
  lifeSpan: TimeSpan
  requestId: string
}

export type RequestFailed = RequestTimedOut

export type ResponseErr<TError> = Err<TError> & {
  requestedAt: Posix
  respondedAt: Posix
  lifeSpan: TimeSpan
  requestId: string
}

export type ResponseOk<TValue> = Ok<TValue> & {
  requestedAt: Posix
  respondedAt: Posix
  lifeSpan: TimeSpan
  requestId: string
}

export type RequestResponse<TError, TValue> =
  | NotAsked
  | Requesting
  | RequestFailed
  | ResponseErr<TError>
  | ResponseOk<TValue>

export const startedRequest = (requestedAt: Posix, lifeSpan: TimeSpan = TimeSpan.minutes(1)): Requesting => {
  return {
    t: 'loading',
    requestedAt,
    lifeSpan,
    requestId: Uuid.generate()
  }
}

export const isRequesting = <TError, TValue>(request: RequestResponse<TError, TValue>): request is Requesting => {
  return request.t === 'loading'
}

export const didRequestTimeout = <TError, TValue>(
  request: RequestResponse<TError, TValue>
): request is RequestFailed => {
  return request.t === 'request-failed' && request.reason === 'timed-out'
}

export const isResponseOk = <TError, TValue>(
  request: RequestResponse<TError, TValue>
): request is ResponseOk<TValue> => {
  return request.t === 'ok'
}

export const isResponseErr = <TError, TValue>(
  request: RequestResponse<TError, TValue>
): request is ResponseErr<TError> => {
  return request.t === 'err'
}

export const response = <TError, TValue>(
  request: RequestResponse<TError, TValue>,
  respondedAt: Posix,
  result: Result<TError, TValue>
): RequestResponse<TError, TValue> => {
  if (request.t === 'not-asked') {
    return request
  }
  return {
    ...result,
    requestedAt: respondedAt,
    respondedAt: respondedAt,
    lifeSpan: request.lifeSpan,
    requestId: request.requestId
  }
}

export const timePassed = <TError, TValue>(
  request: RequestResponse<TError, TValue>,
  now: Posix
): RequestResponse<TError, TValue> => {
  if (isRequesting(request) && TimeSpan.gte(Posix.diff(now, request.requestedAt), request.lifeSpan)) {
    return {
      t: 'request-failed',
      reason: 'timed-out',
      lifeSpan: request.lifeSpan,
      requestId: request.requestId
    }
  }
  return request
}

const subscriptions = <TError, TValue, TMsg>(
  request: RequestResponse<TError, TValue>,
  elapsed: () => TMsg
): Sub<TMsg> => {
  if (isRequesting(request)) {
    return Time.interval('', TimeSpan.seconds(1), elapsed)
  }
  return Sub.None
}

const isErr = <TError, TValue>(request: RequestResponse<TError, TValue>): request is ResponseErr<TError> => {
  return request.t === 'err'
}

const isOk = <TError, TValue>(request: RequestResponse<TError, TValue>): request is ResponseOk<TValue> => {
  return request.t === 'ok'
}

const isTimedOut = <TError, TValue>(request: RequestResponse<TError, TValue>): request is RequestFailed => {
  return request.t === 'request-failed' && request.reason === 'timed-out'
}

export const RequestResponse = {
  isTimedOut,
  isOk,
  isErr,
  isRequesting,
  startedRequest,
  response,
  err: Err,
  ok: Ok,
  timePassed,
  didRequestTimeout,
  subscriptions
}
