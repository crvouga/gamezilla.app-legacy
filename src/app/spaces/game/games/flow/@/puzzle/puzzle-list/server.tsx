import { AppServerModule } from '~/app/@/architecture/app-server'
import { sendToClient } from '~/app/@/server/cmd'
import type { ServerModule } from './types'

const update: ServerModule['update'] = async (input) => {
  return AppServerModule.andThen({}, () => updateListPuzzles(input))
}

const updateListPuzzles: ServerModule['update'] = async (input) => {
  switch (input.msgClient?.t) {
    case 'list-puzzles': {
      const listed = await input.ctx.flowPuzzleDb.list(input.msgClient.input)

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

export const PuzzleListServer = {
  update,
}
