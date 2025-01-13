import { Result, isErr } from '~/@/result'
import { GameBackendModule } from '~/app/spaces/game/games/@/architecture/game-backend-v2'
import { withEventId } from '~/@/event-sourced/event'
import { Variant, VariantDimensions } from '../../../@/variant'
import { Puzzle } from '../../../@/puzzle/puzzle'
import type { BackendModule } from '../../types'
import type { MsgSpace } from './types'

const update: BackendModule['update'] = async (input) => {
  return GameBackendModule.andThen({}, () => updateFromFrontend(input))
}

const updateFromFrontend: BackendModule['update'] = async (input) => {
  switch (input.msgFrontend?.t) {
    case 'create-new-puzzle.user-clicked-create-button': {
      const counted = await input.ctx.puzzleDb.count({
        where: {
          createdBy: {
            equals: input.msgFrontend.userId,
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
        createdBy: input.msgFrontend.userId,
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

      const msgSpace: MsgSpace = {
        t: 'create-new-puzzle.user-created-puzzle',
        created: Result.mapOk(created, () => puzzleNew),
        userId: input.msgFrontend.userId,
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

export const CreateNewPuzzleBackend = {
  update,
}
