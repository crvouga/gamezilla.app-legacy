import { GameServerModule } from 'app/spaces/games/@/architecture/game-server-v2'
import { withEventId } from '@/event-sourced/event'
import type { ServerModule } from '../../types'
import type { MsgCore } from './types'

const update: ServerModule['update'] = async (input) => {
  return GameServerModule.andThen({}, () => updateFromClient(input))
}

const updateFromClient: ServerModule['update'] = async (input) => {
  switch (input.msgClient?.t) {
    case 'delete-forever.user-confirmed': {
      const puzzleBuilder = input.modelCore.screenPuzzleBuilder

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
        msgCore: [withEventId(msgCore)]
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
