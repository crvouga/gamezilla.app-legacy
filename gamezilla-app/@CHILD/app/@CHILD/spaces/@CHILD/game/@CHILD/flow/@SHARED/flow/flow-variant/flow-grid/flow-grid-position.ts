import { P1 } from "gamezilla-app/@SHARED/parsing"

export type Position = { x: number; y: number }

const to = (x: unknown): Position | null => {
  if (P1.obj(x) && P1.has(x, "x", P1.num) && P1.has(x, "y", P1.num)) {
    return x
  }
  return null
}

const is = P1.is(to)

const distance = (a: Position, b: Position) => {
  return Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2)
}

export const Position = {
  distance,
  is,
  to,
}

export const DELTAS: Position[] = [
  { x: -1, y: 0 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
]
