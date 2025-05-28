import { Result } from '~/@/result'
import type { Brand } from '~/@/brand/brand'
import { s } from '~/@/schema'

export type SpaceId = Brand<string, 'SpaceId'>

const namespace = 'space'
const separator = ':'

const is = (id: unknown): id is SpaceId => {
  // todo: better validation
  return typeof id === 'string'
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
  // warning collisions could happen
  // use short id so the logs are more readable
  const spaceId = `${namespace}${separator}${Math.random().toString(36).slice(-6)}`

  if (is(spaceId)) {
    return spaceId
  }

  throw new Error('generated invalid id')
}

export const SpaceId = {
  ...schema,
  is,
  decode,
  generate,
}
