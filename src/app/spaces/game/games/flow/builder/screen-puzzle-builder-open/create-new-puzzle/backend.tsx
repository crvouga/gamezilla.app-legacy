import { Result, isErr } from '~/@/result'
import { GameBackendModule } from '~/app/spaces/game/games/@/architecture/game-backend-v2'
import { withEventId } from '~/@/event-sourced/event'
import { Variant, VariantDimensions } from '../../../@/variant'
import { Puzzle } from '../../../@/puzzle/puzzle'
import type { BackendModule } from '../../types'
import type { MsgCore } from './types'

const update: BackendModule['update'] = async (input) => {
  return GameBackendModule.andThen({}, () => updateFromClient(input))
}

const updateFromClient: BackendModule['update'] = async (input) => {
  switch (input.msgClient?.t) {
    case 'create-new-puzzle.user-clicked-create-button': {
      const counted = await input.ctx.puzzleDb.count({
        where: {
          createdBy: {
            equals: input.msgClient.userId,
          },
        },
      })

      if (isErr(counted)) {
        console.error(counted.error)
      }

      const count = Result.unwrapOr(counted, 0)

      const puzzleNew = await Puzzle.create({
        count: count,
        createdAt: input.ctx.now,
        createdBy: input.msgClient.userId,
        flow: Variant.init({
          terminalsByGroupId: {},
          dimensions: VariantDimensions.init({
            t: 'flow-grid',
            height: 8,
            width: 8,
          }),
        }),
      })

      const created = await input.ctx.puzzleDb.put(puzzleNew)

      const msgCore: MsgCore = {
        t: 'create-new-puzzle.user-created-puzzle',
        created: Result.mapOk(created, () => puzzleNew),
        userId: input.msgClient.userId,
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

export const CreateNewPuzzleBackend = {
  update,
}
