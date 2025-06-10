import { UnixMs } from '~/@/time/unix-ms'
import type { UserId } from '~/app/@/data/user-id'
import { samples } from '../../../@/variant/grid/grid-samples'
import { Puzzle } from '../../../@/puzzle/puzzle'

export const createPuzzle = (createdAt: UnixMs, createdBy: UserId) => {
  return Puzzle.create({
    count: 1,
    createdAt,
    createdBy,
    numberlink: samples['5x5']['1'],
  })
}
