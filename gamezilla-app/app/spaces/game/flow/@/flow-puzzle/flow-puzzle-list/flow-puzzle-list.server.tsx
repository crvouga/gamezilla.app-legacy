import { AppServerModule } from 'gamezilla-app/app/@/architecture/app-server'
import { sendToClient } from 'gamezilla-app/app/@/server'
import type { ServerModule } from './flow-puzzle-list.core'

const update: ServerModule['update'] = async (input) => {
  return AppServerModule.andThen(
    { model: input.model },
    (model) =>
      updateListPuzzles({
        ...input,
        model
      })
    //
  )
}

const updateListPuzzles: ServerModule['update'] = async (input) => {
  const { msgClient, model, deps } = input

  switch (msgClient?.t) {
    case 'flow-puzzle-list.list-puzzles': {
      const listed = await deps.flowPuzzleDb.list(msgClient.input)

      return {
        model: input.model,
        msgCmd: [
          sendToClient(msgClient, {
            t: 'flow-puzzle-list.listed-puzzle',
            listed
          })
        ]
      }
    }

    default: {
      return {
        model
      }
    }
  }
}

export const FlowPuzzleListServer = {
  update
}
