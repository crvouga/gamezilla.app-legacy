import type { Brand } from '~/@/brand/brand'
import { s } from '~/@/schema'
import { Result } from '~/@/result'
import { ShortId } from '../id/short-id'

export type ClientSessionId = Brand<string, 'ClientSessionId'>

const namespace = 'client-session'
const separator = ':'

const is = (id: unknown): id is ClientSessionId => {
  return typeof id === 'string'
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
  const id = ShortId.generate(8)
  const clientSessionId = `${namespace}${separator}${id}`

  if (is(clientSessionId)) {
    return clientSessionId
  }

  throw new Error('generated invalid session id')
}

export const ClientSessionId = {
  ...schema,
  generate,
  decode,
  is,
}
