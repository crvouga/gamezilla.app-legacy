import { s } from '~/@/schema'
import { Posix } from '~/@/time/posix'
import { UserId } from '~/app/@/data/user-id'
import { PuzzleId } from '../../../@/puzzle/puzzle-id'

export const UserStartedPuzzle = s.obj({
  t: s.l('user-started-puzzle'),
  userId: UserId,
  puzzleId: PuzzleId,
  happenedAt: Posix,
})
export type UserStartedPuzzle = s.Infer<typeof UserStartedPuzzle>

export const UserSolvedPuzzle = s.obj({
  t: s.l('user-solved-puzzle'),
  userId: UserId,
  puzzleId: PuzzleId,
  happenedAt: Posix,
})
export type UserSolvedPuzzle = s.Infer<typeof UserSolvedPuzzle>

export const UserUsedHint = s.obj({
  t: s.l('user-used-hint'),
  userId: UserId,
  puzzleId: PuzzleId,
  happenedAt: Posix,
})
export type UserUsedHint = s.Infer<typeof UserUsedHint>

export const UserActivity = s.or(UserStartedPuzzle, UserSolvedPuzzle, UserUsedHint)
export type UserActivity = s.Infer<typeof UserActivity>
