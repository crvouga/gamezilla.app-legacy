import { Posix } from '~/@/time/posix'
import type { UserId } from '~/app/@/data/user-id'
import { samples } from '../../../@/flow/variant/grid/grid-samples'
import { Puzzle } from '../../../@/puzzle/puzzle'

export const createPuzzle = (createdAt: Posix, createdBy: UserId) => {
  return Puzzle.create({
    count: 1,
    createdAt,
    createdBy,
    flow: samples['5x5']['1'],
  })
}
