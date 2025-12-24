import { Result } from '~/@/result'
import type { Brand } from '~/@/brand/brand'
import { Uuid } from '~/@/id/uuid'

export type PartyId = Brand<string, 'PartyId'>

const is = (id: unknown): id is PartyId => {
  return typeof id === 'string' && id.length > 0
}

type Problem = 'invalid_party_id'

const decode = (id: string): Result<Problem, PartyId> => {
  if (is(id)) {
    return Result.Ok(id)
  }

  return Result.Err('invalid_party_id')
}
const generate = (): PartyId => {
  return Uuid.generate() as unknown as PartyId
}

export const PartyId = {
  is,
  decode,
  generate,
}
