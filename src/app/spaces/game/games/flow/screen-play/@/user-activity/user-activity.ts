import { p } from '~/@/schema'
import { Posix } from '~/@/time/posix'
import { UserId } from '~/app/@/data/user-id'
import { PuzzleId } from '../../../@/puzzle/puzzle-id'

export const UserStartedPuzzle = p.obj({
  t: p.l('user-started-puzzle'),
  userId: UserId,
  puzzleId: PuzzleId,
  happenedAt: Posix,
})
export type UserStartedPuzzle = p.Infer<typeof UserStartedPuzzle>

export const UserSolvedPuzzle = p.obj({
  t: p.l('user-solved-puzzle'),
  userId: UserId,
  puzzleId: PuzzleId,
  happenedAt: Posix,
})
export type UserSolvedPuzzle = p.Infer<typeof UserSolvedPuzzle>

export const UserUsedHint = p.obj({
  t: p.l('user-used-hint'),
  userId: UserId,
  puzzleId: PuzzleId,
  happenedAt: Posix,
})
export type UserUsedHint = p.Infer<typeof UserUsedHint>

export const UserActivity = p.or(UserStartedPuzzle, UserSolvedPuzzle, UserUsedHint)
export type UserActivity = p.Infer<typeof UserActivity>
