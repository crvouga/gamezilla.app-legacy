import { UnixMs } from '~/@/time/unix-ms'
import type { UserId } from '~/app/@/data/user-id'
import { Puzzle } from '../../../@/puzzle/puzzle'
import { VariantGridSamples } from '../../../@/variant/grid/grid-samples'

export const createPuzzle = (createdAt: UnixMs, createdBy: UserId) => {
  return Puzzle.create({
    count: 1,
    createdAt,
    createdBy,
    numberlink: VariantGridSamples.samples['5x5']['1'],
  })
}
