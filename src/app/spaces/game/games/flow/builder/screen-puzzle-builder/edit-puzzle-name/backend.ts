import { Err, isErr } from '~/@/result'
import type { UserId } from '~/app/@/data/user-id'
import { GameBackendModule } from '~/app/spaces/game/games/@/architecture/game-backend-v2'
import { withEventId } from '~/@/event-sourced/event'
import type { Puzzle } from '../../../@/puzzle/puzzle'
import type { PuzzleId } from '../../../@/puzzle/puzzle-id'
import { PuzzleName } from '../../../@/puzzle/puzzle-name'
import { FlowBackendCtx } from '../../../@/backend/ctx'
import type { BackendModule } from '../../types'
import type { MsgCore } from './types'

const update: BackendModule['update'] = async (input) => {
  return GameBackendModule.andThen({}, () => updateFromClient({ ...input }))
}

const updateFromClient: BackendModule['update'] = async (input) => {
  switch (input.msgClient?.t) {
    case 'puzzle.edit-name.user-clicked-save-button': {
      const edited = await patchName({
        ...input,
        ...input.msgClient,
      })

      const msgCore: MsgCore = {
        ...input.msgClient,
        t: 'user-edited-puzzle-name',
        edited,
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

const patchName = async (input: { flowPuzzleId: PuzzleId; newName: string; userId: UserId; ctx: FlowBackendCtx }) => {
  const { flowPuzzleId, newName, userId, ctx } = input

  const result = await ctx.puzzleDb.get(flowPuzzleId)

  if (isErr(result)) {
    return result
  }

  const puzzle = result.value

  if (!puzzle) {
    return Err('Failed to find puzzle')
  }

  if (puzzle.createdBy !== userId) {
    return Err('You must be the creator of this puzzle to edit it.')
  }

  const newNameFinal = typeof newName === 'string' && newName.length > 0 ? newName : puzzle.name

  if (!PuzzleName.is(newNameFinal)) {
    return Err('Invalid name')
  }

  const patched: Puzzle = {
    ...puzzle,
    name: newNameFinal,
    lastUpdatedBy: userId,
  }

  const put = await ctx.puzzleDb.put(patched)

  return put
}

export const EditPuzzleNameBackend: Pick<BackendModule, 'update'> = {
  update,
}
