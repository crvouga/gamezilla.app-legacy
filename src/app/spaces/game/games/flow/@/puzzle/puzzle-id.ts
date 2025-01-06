import { Uuid } from '~/@/uuid/uuid'
import type { Brand } from '~/@/brand/brand'
import { p } from '~/@/parser'

export type PuzzleId = Brand<string, 'PuzzleId'>

const namespace = 'flow-puzzle'
const separator = ':'

const is = (flowPuzzleId: unknown): flowPuzzleId is PuzzleId => {
  return typeof flowPuzzleId === 'string'
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
