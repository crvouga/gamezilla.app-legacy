import { andThen } from 'gamezilla-app/app/spaces/game/@/architecture/game-server-v2'
import { ServerModule } from '../types'
import { ScreenPlayPuzzleCore } from './core'
import { MsgCoreEvt } from './types'
import { UserActivity } from '../@/user-activity/user-activity'
import { Posix } from 'gamezilla-app/@/core'
import { FlowPuzzleId } from '../../@/puzzle/puzzle-id'

const update: ServerModule['update'] = async (input) => {
  return andThen(
    {},
    //
    () => recordUserActivity(input)
  )
}

export const msgCoreToUserActivity = (
  input: MsgCoreEvt & { puzzleId: FlowPuzzleId; happenedAt: Posix }
): UserActivity[] => {
  switch (input.t) {
    case 'user-completed-puzzle': {
      return [
        {
          t: 'user-solved-puzzle',
          happenedAt: Posix.now(),
          puzzleId: input.puzzleId,
          userId: input.userId
        }
      ]
    }
    case 'user-used-hint': {
      return [
        {
          t: 'user-used-hint',
          happenedAt: Posix.now(),
          puzzleId: input.puzzleId,
          userId: input.userId
        }
      ]
    }
  }
}

const recordUserActivity: ServerModule['update'] = async (input) => {
  if (input.msgCore && input.modelCore.screen.t === 'screen-play-puzzle') {
    const updated = ScreenPlayPuzzleCore.updateScreen(input.modelCore.screen, input.msgCore)

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

export const ScreenPlayPuzzleServer = {
  update
}
