import { p } from 'gamezilla-app/@/core/parser'

const parser = p.brand(p.str, 'EventId')

export type EventId = p.Infer<typeof parser>

const SEPARATOR = '-'

const init = (): EventId => {
  return cast(`1${SEPARATOR}0`)
}

const is = (id: string): id is EventId => {
  return id.includes(SEPARATOR) || id === init()
}

const cast = (id: string): EventId => {
  if (!is(id)) {
    throw new Error(`Invalid EventId: ${id}`)
  }
  return id
}

const increment = (id: EventId): EventId => {
  const [milliseconds, sequence] = id.split(SEPARATOR)
  if (sequence === undefined) {
    return cast(`${milliseconds}${SEPARATOR}1`)
  }
  const incrementedSequence = (parseInt(sequence, 10) + 1).toString()
  return cast(`${milliseconds}${SEPARATOR}${incrementedSequence}`)
}

const toComparable = (id: EventId): number => {
  const milliseconds = id.split(SEPARATOR)[0]
  if (milliseconds === undefined) {
    throw new Error(`Invalid EventId: ${id}`)
  }
  return parseInt(milliseconds, 10)
}

export const EventId = {
  parser,
  init,
  increment,
  toComparable
}
