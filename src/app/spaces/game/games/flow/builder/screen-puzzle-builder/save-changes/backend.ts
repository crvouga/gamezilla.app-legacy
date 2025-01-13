import { GameBackendModule } from '~/app/spaces/game/games/@/architecture/game-backend-v2'
import { withEventId } from '~/@/event-sourced/event'
import { Result } from '~/@/result'
import type { BackendModule } from '../../types'
import type { MsgSpace } from './types'

const update: BackendModule['update'] = async (input) => {
  return GameBackendModule.andThen({}, () => updateFromFrontend({ ...input }))
}

const updateFromFrontend: BackendModule['update'] = async (input) => {
  switch (input.msgFrontend?.t) {
    case 'screen-puzzle-builder.save-changes.user-clicked-save-and-exit':
    case 'screen-puzzle-builder.save-changes.user-clicked-save-button': {
      const saved = await input.ctx.puzzleDb.put({
        ...input.msgFrontend.puzzle,
        lastUpdatedBy: input.msgFrontend.userId,
        lastUpdatedAt: input.ctx.now,
      })

      const puzzle = input.msgFrontend.puzzle

      const msgSpace: MsgSpace = {
        t: 'screen-puzzle-builder.saved-puzzle',
        saved: Result.mapOk(saved, () => puzzle),
        userId: input.msgFrontend.puzzle.createdBy,
      }

      return {
        msgSpace: [withEventId(msgSpace)],
      }
    }

    default: {
      return {}
    }
  }
}

export const SaveChangesBackend = {
  update,
}
