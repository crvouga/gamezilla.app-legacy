import { AppServerModule } from '~/app/@/architecture/app-server'
import { sendToClient } from '~/app/@/server/cmd'
import type { ServerModule } from './types'

const update: ServerModule['update'] = async (input) => {
  return AppServerModule.andThen({}, () => updateListPuzzles(input))
}

const updateListPuzzles: ServerModule['update'] = async (input) => {
  switch (input.msgClient?.t) {
    case 'flow-cmd.puzzle-list.list-puzzles': {
      const listed = await input.ctx.flowPuzzleDb.list(input.msgClient.input)

      return {
        msgCmd: [
          sendToClient(input.msgClient, {
            t: 'flow-cmd.puzzle-list.listed-puzzle',
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

export const PuzzleListServer = {
  update,
}
