import { AppBackendModule } from '~/app/@/architecture/app-server'
import { sendToClient } from '~/app/@/server/cmd'
import type { BackendModule } from './types'

const update: BackendModule['update'] = async (input) => {
  return AppBackendModule.andThen({}, () => updateListPacks(input))
}

const updateListPacks: BackendModule['update'] = async (input) => {
  switch (input.msgClient?.t) {
    case 'list-packs': {
      const listed = await input.ctx.packDb.list(input.msgClient.input)

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

export const PackListBackend = {
  update,
}
