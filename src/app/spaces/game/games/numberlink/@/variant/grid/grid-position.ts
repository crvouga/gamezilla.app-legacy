import { s } from '~/@/schema'

const schema = s.obj({
  x: s.num(),
  y: s.num(),
})

export type VariantGridPosition = s.Infer<typeof schema>

const distance = (a: VariantGridPosition, b: VariantGridPosition) => {
  return (b.x - a.x) ** 2 + (b.y - a.y) ** 2
}

const manhattanDistance = (a: VariantGridPosition, b: VariantGridPosition) => {
  return Math.abs(b.x - a.x) + Math.abs(b.y - a.y)
}

const DELTAS: VariantGridPosition[] = [
  { x: -1, y: 0 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
]

export const VariantGridPosition = {
  schema: schema,
  manhattanDistance,
  distance,
  DELTAS,
}
