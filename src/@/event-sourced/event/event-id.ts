import { Err, Ok, type Result } from '~/@/result'
import type { Brand } from '~/@/brand/brand'
import { p } from '~/@/schema'

export type EventId = Brand<string, 'EventId'>

const namespace = 'event'
const separator = ':'
const namespaceWithSeparator = `${namespace}${separator}`

const is = (id: unknown): id is EventId => {
  return typeof id === 'string'
}

const parser = p.custom(is, 'Invalid event id')

type Problem = 'invalid_id'

const decode = (id: string): Result<Problem, EventId> => {
  if (is(id)) {
    return Ok(id)
  }

  return Err('invalid_id')
}

const generate = (): EventId => {
  return (namespaceWithSeparator + Math.floor(Math.random() * 1_000_000_000)) as EventId
}

export const EventId = {
  ...parser,
  is,
  decode,
  generate,
}
