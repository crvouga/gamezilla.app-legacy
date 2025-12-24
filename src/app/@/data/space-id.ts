import { Result } from '~/@/result'
import type { Brand } from '~/@/brand/brand'
import { s } from '~/@/schema'
import { Uuid } from '~/@/id/uuid'

export type SpaceId = Brand<string, 'SpaceId'>

const is = (id: unknown): id is SpaceId => {
  return typeof id === 'string' && Uuid.is(id)
}
const schema = s.custom(is, 'Invalid space id')

type Problem = 'invalid_id'

const decode = (id: string): Result<Problem, SpaceId> => {
  if (is(id)) {
    return Result.Ok(id)
  }

  return Result.Err('invalid_id')
}

const generate = (): SpaceId => {
  return Uuid.generate() as unknown as SpaceId
}

export const SpaceId = {
  ...schema,
  is,
  decode,
  generate,
}
