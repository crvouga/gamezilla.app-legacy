import { GameBackendModule } from '~/app/spaces/game/games/@/architecture/game-server-v2'
import { withEventId } from '~/@/event-sourced/event'
import { Result } from '~/@/result'
import type { BackendModule } from '../../types'
import type { MsgCore } from './types'

const update: BackendModule['update'] = async (input) => {
  return GameBackendModule.andThen({}, () => updateFromClient({ ...input }))
}

const updateFromClient: BackendModule['update'] = async (input) => {
  switch (input.msgClient?.t) {
    case 'screen-puzzle-builder.save-changes.user-clicked-save-and-exit':
    case 'screen-puzzle-builder.save-changes.user-clicked-save-button': {
      const saved = await input.ctx.puzzleDb.put({
        ...input.msgClient.puzzle,
        lastUpdatedBy: input.msgClient.userId,
        lastUpdatedAt: input.ctx.now,
      })

      const puzzle = input.msgClient.puzzle

      const msgCore: MsgCore = {
        t: 'screen-puzzle-builder.saved-puzzle',
        saved: Result.mapOk(saved, () => puzzle),
        userId: input.msgClient.puzzle.createdBy,
      }

      return {
        msgCore: [withEventId(msgCore)],
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
