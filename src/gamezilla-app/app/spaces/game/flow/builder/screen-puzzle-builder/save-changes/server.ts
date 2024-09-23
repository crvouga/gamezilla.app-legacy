import { GameServerModule } from 'gamezilla-app/app/spaces/game/@/architecture/game-server-v2'
import { withId } from 'gamezilla-app/app/spaces/@/event'
import { Result } from 'gamezilla-app/@/core'
import type { ServerModule } from '../../builder.types'
import type { MsgCore } from './types'

const update: ServerModule['update'] = async (input) => {
  return GameServerModule.andThen({}, () => updateFromClient({ ...input }))
}

const updateFromClient: ServerModule['update'] = async (input) => {
  switch (input.msgClient?.t) {
    case 'screen-puzzle-builder.save-changes.user-clicked-save-and-exit':
    case 'screen-puzzle-builder.save-changes.user-clicked-save-button': {
      const saved = await input.ctx.flowPuzzleDb.put({
        ...input.msgClient.puzzle,
        lastUpdatedBy: input.msgClient.userId,
        lastUpdatedAt: input.ctx.now
      })

      const puzzle = input.msgClient.puzzle

      const msgCore: MsgCore = {
        t: 'screen-puzzle-builder.saved-puzzle',
        saved: Result.mapOk(saved, () => puzzle),
        userId: input.msgClient.puzzle.createdBy
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

export const SaveChangesServer = {
  update
}
