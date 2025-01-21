import { Uuid } from '~/@/uuid/uuid'
import type { Brand } from '~/@/brand/brand'
import { p } from '~/@/parser'

export type PuzzleId = Brand<string, 'PuzzleId'>

const namespace = 'puzzle'
const separator = ':'

const is = (maybePuzzleId: unknown): maybePuzzleId is PuzzleId => {
  return typeof maybePuzzleId === 'string' && maybePuzzleId.trim().length > 0
}

const parser = p.custom(is, 'Invalid flow puzzle id')

const generate = () => {
  const id = Uuid.generate()
  const flowPuzzleId = `${namespace}${separator}${id}`

  if (is(flowPuzzleId)) {
    return flowPuzzleId
  }

  throw new Error('impossible condition. generated invalid id.')
}

export const PuzzleId = {
  ...parser,
  generate,

  is,
}
