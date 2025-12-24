import { Result } from '~/@/result'
import { s } from '~/@/schema'
import { ShortId } from '../id/short-id'

const schema = s.brand(s.str(), 'ClientId')

export type ClientId = s.Infer<typeof schema>

const is = (id: unknown): id is ClientId => {
  return typeof id === 'string'
}

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
