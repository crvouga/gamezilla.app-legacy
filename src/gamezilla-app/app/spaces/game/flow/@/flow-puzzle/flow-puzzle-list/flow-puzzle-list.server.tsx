import { AppServerModule } from 'gamezilla-app/app/@/architecture/app-server'
import { sendToClient } from 'gamezilla-app/app/@/server'
import type { ServerModule } from './flow-puzzle-list.core'

const update: ServerModule['update'] = async (input) => {
  return AppServerModule.andThen({}, () => updateListPuzzles(input))
}

const updateListPuzzles: ServerModule['update'] = async (input) => {
  const { msgClient, deps } = input

  switch (msgClient?.t) {
    case 'flow-puzzle-list.list-puzzles': {
      const listed = await deps.flowPuzzleDb.list(msgClient.input)

      return {
        msgCmd: [
          sendToClient(msgClient, {
            t: 'flow-puzzle-list.listed-puzzle',
            listed
          })
        ]
      }
    }

    default: {
      return {}
    }
  }
}

export const FlowPuzzleListServer = {
  update
}
