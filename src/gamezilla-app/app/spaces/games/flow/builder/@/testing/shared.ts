import type { UserId } from 'gamezilla-app/app/@/data'
import type { Posix } from '@/core'
import { FlowPuzzle } from '../../../@/puzzle/puzzle'
import { samples } from '../../../@/flow/flow-variant/flow-grid/flow-grid-samples'

export const createFlowPuzzle = (createdAt: Posix, createdBy: UserId) => {
  return FlowPuzzle.create({
    count: 1,
    createdAt,
    createdBy,
    flow: samples['5x5']['1']
  })
}
