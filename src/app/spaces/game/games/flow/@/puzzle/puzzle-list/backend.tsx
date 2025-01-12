import { AppBackendModule } from '~/app/@/architecture/app-backend'
import { sendToClient } from '~/app/@/backend/cmd'
import type { BackendModule } from './types'

const update: BackendModule['update'] = async (input) => {
  return AppBackendModule.andThen({}, () => updateListPuzzles(input))
}

const updateListPuzzles: BackendModule['update'] = async (input) => {
  switch (input.msgClient?.t) {
    case 'list-puzzles': {
      const listed = await input.ctx.puzzleDb.list(input.msgClient.input)

      return {
        msgCmd: [
          sendToClient(input.msgClient, {
            t: 'listed-puzzle',
            listed,
          }),
        ],
      }
    }

    default: {
      return {}
    }
  }
}

export const PuzzleListBackend = {
  update,
}
