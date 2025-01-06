import { AppServerModule } from '~/app/@/architecture/app-server'
import { sendToClient } from '~/app/@/server/cmd'
import type { ServerModule } from './types'

const update: ServerModule['update'] = async (input) => {
  return AppServerModule.andThen({}, () => updateListPacks(input))
}

const updateListPacks: ServerModule['update'] = async (input) => {
  switch (input.msgClient?.t) {
    case 'list-packs': {
      const listed = await input.ctx.flowPackDb.list(input.msgClient.input)

      return {
        msgCmd: [
          sendToClient(input.msgClient, {
            t: 'listed-packs',
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

export const PackListServer = {
  update,
}
