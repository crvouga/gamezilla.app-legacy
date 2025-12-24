import { Err, Ok, type Result } from '~/@/result'
import type { Brand } from '~/@/brand/brand'
import { s } from '~/@/schema'

export type EventId = Brand<string, 'EventId'>

const is = (id: unknown): id is EventId => {
  return typeof id === 'string' && id.length > 0
}

const schema = s.custom(is, 'Invalid event id')

type Problem = 'invalid_id'

const decode = (id: string): Result<Problem, EventId> => {
  if (is(id)) {
    return Ok(id)
  }

  return Err('invalid_id')
}

const generate = (): EventId => {
  return Math.floor(Math.random() * 1_000_000_000).toString() as EventId
}

export const EventId = {
  ...schema,
  is,
  decode,
  generate,
}
