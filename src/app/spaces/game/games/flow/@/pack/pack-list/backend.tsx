import { AppBackendModule } from '~/app/@/architecture/app-backend'
import { sendToFrontend } from '~/app/@/backend/cmd'
import type { BackendModule } from './types'

const update: BackendModule['update'] = async (input) => {
  return AppBackendModule.andThen({}, () => updateListPacks(input))
}

const updateListPacks: BackendModule['update'] = async (input) => {
  switch (input.msgFrontend?.t) {
    case 'list-packs': {
      const listed = await input.ctx.packDb.list(input.msgFrontend.input)

      return {
        msgCmd: [
          sendToFrontend(input.msgFrontend, {
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
