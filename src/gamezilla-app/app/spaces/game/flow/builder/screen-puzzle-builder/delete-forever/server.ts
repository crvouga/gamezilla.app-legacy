import { GameServerModule } from 'gamezilla-app/app/spaces/@/architecture/game-server-v2'
import { withId } from 'gamezilla-app/app/spaces/@/event'
import type { ServerModule } from '../../builder.types'
import type { MsgCore } from './types'

const update: ServerModule['update'] = async (input) => {
  return GameServerModule.andThen({}, () => updateFromClient(input))
}

const updateFromClient: ServerModule['update'] = async (input) => {
  const { modelCore, msgClient, deps } = input

  switch (msgClient?.t) {
    case 'delete-forever.user-confirmed': {
      const puzzleBuilder = modelCore.puzzleBuilder

      if (!puzzleBuilder) {
        return {}
      }

      const deleted = await deps.flowPuzzleDb.zap({
        id: puzzleBuilder.puzzle.id,
        deletedByUserId: msgClient.userId
      })

      const msgCore: MsgCore = {
        t: 'user-deleted-puzzle',
        flowPuzzleId: puzzleBuilder.puzzle.id,
        userId: msgClient.userId,
        deleted
      }

      return {
        msgCore: [withId(msgCore)]
      }
    }

    default: {
      return {}
    }
  }
}

export const DeleteForeverServer: Pick<ServerModule, 'update'> = {
  update
}
