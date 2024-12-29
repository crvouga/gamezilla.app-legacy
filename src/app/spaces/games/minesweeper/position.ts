import { List, Set } from '~/@/core'
import { NonNegInt } from '~/@/math/non-neg-int'

export type Position = {
  x: NonNegInt
  y: NonNegInt
}

const init = (x: NonNegInt, y: NonNegInt): Position => {
  return {
    x,
    y
  }
}

const range = (maxX: NonNegInt, maxY: NonNegInt): List<Position> => {
  return List.product(List.range(NonNegInt.of(0), maxX), List.range(NonNegInt.of(0), maxY), init)
}

const add = (a: Position, b: Position): Position => {
  return {
    x: NonNegInt.add(a.x, b.x),
    y: NonNegInt.add(a.y, b.y)
  }
}

const sub = (a: Position, b: Position): Position => {
  return {
    x: NonNegInt.sub(a.x, b.x),
    y: NonNegInt.sub(a.y, b.y)
  }
}

const toKey = (position: Position) => {
  return `${NonNegInt.str(position.x)},${NonNegInt.str(position.y)}`
}

const toAdjacent = (position: Position): Set<Position> => {
  const deltas = range(NonNegInt.of(1), NonNegInt.of(1))

  const added = List.map(deltas, (x) => add(position, x))

  const subtracted = List.map(deltas, (x) => sub(position, x))

  const all = List.concat(added, subtracted)

  const adjacent = Set.from(toKey, all)

  return adjacent
}

export const Position = {
  init,
  toKey,
  range,
  add,
  sub,
  toAdjacent
}
