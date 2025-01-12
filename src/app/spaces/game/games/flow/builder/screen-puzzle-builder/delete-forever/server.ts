import { GameBackendModule } from '~/app/spaces/game/games/@/architecture/game-server-v2'
import { withEventId } from '~/@/event-sourced/event'
import type { BackendModule } from '../../types'
import type { MsgCore } from './types'

const update: BackendModule['update'] = async (input) => {
  return GameBackendModule.andThen({}, () => updateFromClient(input))
}

const updateFromClient: BackendModule['update'] = async (input) => {
  switch (input.msgClient?.t) {
    case 'delete-forever.user-confirmed': {
      const puzzleBuilder = input.modelCore.screenPuzzleBuilder

      if (!puzzleBuilder) {
        return {}
      }

      const deleted = await input.ctx.puzzleDb.zap({
        id: puzzleBuilder.puzzle.id,
        deletedByUserId: input.msgClient.userId,
      })

      const msgCore: MsgCore = {
        t: 'user-deleted-puzzle',
        flowPuzzleId: puzzleBuilder.puzzle.id,
        userId: input.msgClient.userId,
        deleted,
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

export const DeleteForeverBackend: Pick<BackendModule, 'update'> = {
  update,
}
