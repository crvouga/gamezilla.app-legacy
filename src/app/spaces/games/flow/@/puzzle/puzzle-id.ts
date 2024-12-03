import { Uuid } from '@/core'
import type { Brand } from '@/core/brand'
import { p } from '@/core/parser'

export type FlowPuzzleId = Brand<string, 'FlowPuzzleId'>

const namespace = 'flow-puzzle'
const separator = ':'

const is = (flowPuzzleId: unknown): flowPuzzleId is FlowPuzzleId => {
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

export const FlowPuzzleId = {
  ...parser,
  generate,

  is
}
