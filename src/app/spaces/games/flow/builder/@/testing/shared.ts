import type { UserId } from '~/app/@/data'
import type { Posix } from '~/@/core'
import { Puzzle } from '../../../@/puzzle/puzzle'
import { samples } from '../../../@/flow/flow-variant/flow-grid/flow-grid-samples'

export const createPuzzle = (createdAt: Posix, createdBy: UserId) => {
  return Puzzle.create({
    count: 1,
    createdAt,
    createdBy,
    flow: samples['5x5']['1']
  })
}
