import { Uuid } from '~/@/id/uuid'
import type { Brand } from '~/@/brand/brand'
import { s } from '~/@/schema'

export type PuzzleId = Brand<string, 'PuzzleId'>

const namespace = 'game-numberlink-puzzle'
const separator = ':'

const is = (maybePuzzleId: unknown): maybePuzzleId is PuzzleId => {
  return typeof maybePuzzleId === 'string' && maybePuzzleId.trim().length > 0
}

const schema = s.custom(is, 'Invalid flow puzzle id')

const generate = () => {
  const id = Uuid.generate()
  const puzzleId = `${namespace}${separator}${id}`

  if (is(puzzleId)) {
    return puzzleId
  }

  throw new Error('impossible condition. generated invalid id.')
}

export const PuzzleId = {
  ...schema,
  generate,

  is,
}
