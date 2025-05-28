import { s } from '~/@/schema'

const schema = s.brand(s.str, 'EventId')

export type EventId = s.Infer<typeof schema>

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
  schema,
  init,
  increment,
  toComparable,
}
