import { Posix } from '~/@/time/posix'
import { GameBackendModule } from '~/app/spaces/game/games/@/architecture/game-backend-v2'
import { PuzzleId } from '../../@/puzzle/puzzle-id'
import { UserActivity } from '../@/user-activity/user-activity'
import { BackendModule } from '../types'
import { ScreenPlayPuzzleSpace } from './space'
import { MsgSpaceEvt } from './types'

const update: BackendModule['update'] = async (input) => {
  return GameBackendModule.andThen(
    {},
    //
    () => recordUserActivity(input),
  )
}

export const msgSpaceToUserActivity = (
  input: MsgSpaceEvt & { puzzleId: PuzzleId; happenedAt: Posix },
): UserActivity[] => {
  switch (input.t) {
    case 'user-completed-puzzle': {
      return [
        {
          t: 'user-solved-puzzle',
          happenedAt: Posix.now(),
          puzzleId: input.puzzleId,
          userId: input.userId,
        },
      ]
    }
    case 'user-used-hint': {
      return [
        {
          t: 'user-used-hint',
          happenedAt: Posix.now(),
          puzzleId: input.puzzleId,
          userId: input.userId,
        },
      ]
    }
  }
}

const recordUserActivity: BackendModule['update'] = async (input) => {
  if (input.msgSpace && input.modelSpace.screen.t === 'screen-play-puzzle') {
    const updated = ScreenPlayPuzzleSpace.updateScreen({
      modelSpace: input.modelSpace.screen,
      msgSpace: input.msgSpace,
      ctx: input.ctx,
    })

    for (const event of updated.events ?? []) {
      switch (event.t) {
        case 'user-completed-puzzle': {
          return {}
        }

        case 'user-used-hint': {
          return {}
        }
      }
    }

    return {}
  }

  return {}
}

export const ScreenPlayPuzzleBackend = {
  update,
}
