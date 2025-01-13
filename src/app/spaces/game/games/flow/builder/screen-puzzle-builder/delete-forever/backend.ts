import { GameBackendModule } from '~/app/spaces/game/games/@/architecture/game-backend-v2'
import { withEventId } from '~/@/event-sourced/event'
import type { BackendModule } from '../../types'
import type { MsgSpace } from './types'

const update: BackendModule['update'] = async (input) => {
  return GameBackendModule.andThen({}, () => updateFromFrontend(input))
}

const updateFromFrontend: BackendModule['update'] = async (input) => {
  switch (input.msgFrontend?.t) {
    case 'delete-forever.user-confirmed': {
      const puzzleBuilder = input.modelSpace.screenPuzzleBuilder

      if (!puzzleBuilder) {
        return {}
      }

      const deleted = await input.ctx.puzzleDb.zap({
        id: puzzleBuilder.puzzle.id,
        deletedByUserId: input.msgFrontend.userId,
      })

      const msgSpace: MsgSpace = {
        t: 'user-deleted-puzzle',
        flowPuzzleId: puzzleBuilder.puzzle.id,
        userId: input.msgFrontend.userId,
        deleted,
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

export const DeleteForeverBackend: Pick<BackendModule, 'update'> = {
  update,
}
