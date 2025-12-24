import type { Brand } from '~/@/brand/brand'
import { s } from '~/@/schema'
import { Result } from '~/@/result'
import { ShortId } from '../id/short-id'

export type ClientSessionId = Brand<string, 'ClientSessionId'>

const is = (id: unknown): id is ClientSessionId => {
  return typeof id === 'string' && id.length > 0
}

const schema = s.custom(is, 'Invalid client session id')

type Problem = 'invalid-client-session-id'

export const decode = (id: string): Result<Problem, ClientSessionId> => {
  if (is(id)) {
    return Result.Ok(id)
  }

  return Result.Err('invalid-client-session-id')
}

export const generate = (): ClientSessionId => {
  return ShortId.generate(8) as ClientSessionId
}

export const ClientSessionId = {
  ...schema,
  generate,
  decode,
  is,
}
