import { s } from '~/@/schema'

export const parser = s.obj({
  x: s.num,
  y: s.num,
})

export type Position = s.Infer<typeof parser>

const distance = (a: Position, b: Position) => {
  return (b.x - a.x) ** 2 + (b.y - a.y) ** 2
}

const manhattanDistance = (a: Position, b: Position) => {
  return Math.abs(b.x - a.x) + Math.abs(b.y - a.y)
}

export const Position = {
  parser,
  manhattanDistance,
  distance,
}

export const DELTAS: Position[] = [
  { x: -1, y: 0 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
]
