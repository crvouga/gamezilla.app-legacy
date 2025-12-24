import type { Brand } from '~/@/brand/brand'
import { s } from '~/@/schema'
import { Uuid } from '~/@/id/uuid'

export type PuzzleId = Brand<string, 'PuzzleId'>

const is = (maybePuzzleId: unknown): maybePuzzleId is PuzzleId => {
  return typeof maybePuzzleId === 'string' && maybePuzzleId.length > 0
}

const schema = s.custom(is, 'Invalid flow puzzle id')

const generate = (): PuzzleId => {
  return Uuid.generate() as unknown as PuzzleId
}

export const PuzzleId = {
  ...schema,
  generate,
  is,
}
