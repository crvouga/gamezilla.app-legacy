import { GameServerModule } from 'gamezilla-app/app/spaces/@/architecture/game-server-v2'
import { withId } from 'gamezilla-app/app/spaces/@/event'
import type { ServerModule } from '../../builder.types'
import type { MsgCore } from './types'

const update: ServerModule['update'] = async (input) => {
  return GameServerModule.andThen({ model: input.model }, (model) =>
    updateFromClient({
      ...input,
      model
    })
  )
}

const updateFromClient: ServerModule['update'] = async (input) => {
  const { modelCore, msgClient, model, deps } = input

  switch (msgClient?.t) {
    case 'delete-forever.user-confirmed': {
      const puzzleBuilder = modelCore.puzzleBuilder

      if (!puzzleBuilder) {
        return {
          model
        }
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
        model,
        msgCore: [withId(msgCore)]
      }
    }

    default: {
      return {
        model
      }
    }
  }
}

export const DeleteForeverServer: Pick<ServerModule, 'update'> = {
  update
}
