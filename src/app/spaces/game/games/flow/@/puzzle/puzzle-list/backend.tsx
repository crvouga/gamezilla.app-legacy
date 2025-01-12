import { AppBackendModule } from '~/app/@/architecture/app-backend'
import { sendToFrontend } from '~/app/@/backend/cmd'
import type { BackendModule } from './types'

const update: BackendModule['update'] = async (input) => {
  return AppBackendModule.andThen({}, () => updateListPuzzles(input))
}

const updateListPuzzles: BackendModule['update'] = async (input) => {
  switch (input.msgFrontend?.t) {
    case 'list-puzzles': {
      const listed = await input.ctx.puzzleDb.list(input.msgFrontend.input)

      return {
        msgCmd: [
          sendToFrontend(input.msgFrontend, {
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
