import { Result, isErr } from 'gamezilla-app/@/core'
import { GameServerModule } from 'gamezilla-app/app/spaces/games/@/architecture/game-server-v2'
import { withEventId } from 'gamezilla-app/@/event-sourced/event'
import { FlowVariant, FlowVariantDimensions } from '../../../@/flow'
import { FlowPuzzle } from '../../../@/puzzle/puzzle'
import type { ServerModule } from '../../types'
import type { MsgCore } from './types'

const update: ServerModule['update'] = async (input) => {
  return GameServerModule.andThen({}, () => updateFromClient(input))
}

const updateFromClient: ServerModule['update'] = async (input) => {
  switch (input.msgClient?.t) {
    case 'create-new-puzzle.user-clicked-create-button': {
      const counted = await input.ctx.flowPuzzleDb.count({
        where: {
          createdBy: {
            equals: input.msgClient.userId
          }
        }
      })

      if (isErr(counted)) {
        console.error(counted.error)
      }

      const count = Result.unwrapOr(counted, 0)

      const puzzleNew = await FlowPuzzle.create({
        count: count,
        createdAt: input.ctx.now,
        createdBy: input.msgClient.userId,
        flow: FlowVariant.init({
          terminalsByGroupId: {},
          dimensions: FlowVariantDimensions.init({
            t: 'flow-grid',
            height: 8,
            width: 8
          })
        })
      })

      const created = await input.ctx.flowPuzzleDb.put(puzzleNew)

      const msgCore: MsgCore = {
        t: 'create-new-puzzle.user-created-puzzle',
        created: Result.mapOk(created, () => puzzleNew),
        userId: input.msgClient.userId
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

export const CreateNewPuzzleServer = {
  update
}
