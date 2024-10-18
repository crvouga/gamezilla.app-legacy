import { GameServerModule } from 'gamezilla-app/app/spaces/game/@/architecture/game-server-v2'
import { withId } from 'gamezilla-app/app/spaces/@/event'
import type { ServerModule } from '../../types'
import type { MsgCore } from './types'

const update: ServerModule['update'] = async (input) => {
  return GameServerModule.andThen({}, () => updateFromClient(input))
}

const updateFromClient: ServerModule['update'] = async (input) => {
  switch (input.msgClient?.t) {
    case 'delete-forever.user-confirmed': {
      const puzzleBuilder = input.modelCore.puzzleBuilder

      if (!puzzleBuilder) {
        return {}
      }

      const deleted = await input.ctx.flowPuzzleDb.zap({
        id: puzzleBuilder.puzzle.id,
        deletedByUserId: input.msgClient.userId
      })

      const msgCore: MsgCore = {
        t: 'user-deleted-puzzle',
        flowPuzzleId: puzzleBuilder.puzzle.id,
        userId: input.msgClient.userId,
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
