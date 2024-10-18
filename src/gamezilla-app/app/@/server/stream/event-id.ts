import { p } from 'gamezilla-app/@/core/parser'

const parser = p.brand(p.str, 'EventId')

export type EventId = p.Infer<typeof parser>

const SEPERATOR = '-'

const init = (): EventId => {
  return cast(`1${SEPERATOR}0`)
}

const is = (id: string): id is EventId => {
  return id.includes(SEPERATOR) || id === init()
}

const cast = (id: string): EventId => {
  if (!is(id)) {
    throw new Error(`Invalid EventId: ${id}`)
  }
  return id
}

const increment = (id: EventId): EventId => {
  const [milliseconds, sequence] = id.split(SEPERATOR)
  if (sequence === undefined) {
    return cast(`${milliseconds}${SEPERATOR}1`)
  }
  const incrementedSequence = (parseInt(sequence, 10) + 1).toString()
  return cast(`${milliseconds}${SEPERATOR}${incrementedSequence}`)
}

export const EventId = {
  parser,
  init,
  increment
}
