import type { Brand } from '~/@/brand/brand'
import { Result } from '~/@/result'
import { s } from '~/@/schema'
import { ShortId } from '../id/short-id'

export type ClientId = Brand<string, 'ClientId'>

const is = (id: unknown): id is ClientId => {
  return typeof id === 'string' && id.length > 0
}

const schema = s.custom(is, 'Invalid client id')

type Problem = 'invalid-client-id'

const decode = (id: string): Result<Problem, ClientId> => {
  if (is(id)) {
    return Result.Ok(id)
  }

  return Result.Err('invalid-client-id')
}

const generate = (): ClientId => {
  return ShortId.generate(5) as ClientId
}

export const ClientId = {
  ...schema,
  is,
  decode,
  generate,
}
