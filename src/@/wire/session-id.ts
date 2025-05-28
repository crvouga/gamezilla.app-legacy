import type { Brand } from '~/@/brand/brand'
import { Result } from '~/@/result'
import { s } from '~/@/schema'
import { ShortId } from '../id/short-id'

export type SessionId = Brand<string, 'SessionId'>

const namespace = 'session'
const separator = ':'

const is = (id: unknown): id is SessionId => {
  return typeof id === 'string' && id.startsWith(`${namespace}${separator}`)
}

const schema = s.custom(is, 'Invalid session id')

type Problem = 'invalid-session-id'

export const decode = (id: string): Result<Problem, SessionId> => {
  if (is(id)) {
    return Result.Ok(id)
  }

  return Result.Err('invalid-session-id')
}

export const generate = (): SessionId => {
  const id = ShortId.generate(8)
  const sessionId = `${namespace}${separator}${id}`

  if (is(sessionId)) {
    return sessionId
  }

  throw new Error('generated invalid session id')
}

export const SessionId = {
  ...schema,
  generate,
  decode,
  is,
}
