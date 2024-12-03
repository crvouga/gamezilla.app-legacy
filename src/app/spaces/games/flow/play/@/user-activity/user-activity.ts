import { p } from '@/core/parser'
import { UserId } from 'app/@/data'
import { FlowPuzzleId } from '../../../@/puzzle/puzzle-id'
import { Posix } from '@/core'

export const UserStartedPuzzle = p.obj({
  t: p.l('user-started-puzzle'),
  userId: UserId,
  puzzleId: FlowPuzzleId,
  happenedAt: Posix
})
export type UserStartedPuzzle = p.Infer<typeof UserStartedPuzzle>

export const UserSolvedPuzzle = p.obj({
  t: p.l('user-solved-puzzle'),
  userId: UserId,
  puzzleId: FlowPuzzleId,
  happenedAt: Posix
})
export type UserSolvedPuzzle = p.Infer<typeof UserSolvedPuzzle>

export const UserUsedHint = p.obj({
  t: p.l('user-used-hint'),
  userId: UserId,
  puzzleId: FlowPuzzleId,
  happenedAt: Posix
})
export type UserUsedHint = p.Infer<typeof UserUsedHint>

export const UserActivity = p.or(UserStartedPuzzle, UserSolvedPuzzle, UserUsedHint)
export type UserActivity = p.Infer<typeof UserActivity>
