import { sendToFrontend } from '~/app/@/backend/cmd'
import { GameBackendModule } from '~/app/spaces/game/games/@/architecture/game-backend-v2'
import type { Pack } from '../../../@/pack/pack'
import { PackId } from '../../../@/pack/pack-id'
import { PackName } from '../../../@/pack/pack-name'
import type { BackendModule } from '../../types'

const update: BackendModule['update'] = async (input) => {
  return GameBackendModule.andThen({}, () => updateFromFrontend(input))
}

const updateFromFrontend: BackendModule['update'] = async (input) => {
  switch (input.msgFrontend?.t) {
    case 'create-new-pack.clicked-create-button': {
      const counted = await input.ctx.packDb.count({
        where: {
          createdBy: input.msgFrontend.userId,
        },
      })

      if (counted.t === 'err') {
        return {}
      }

      const packNew: Pack = {
        createdAt: input.ctx.now,
        createdBy: input.msgFrontend.userId,
        id: PackId.generate(),
        lastUpdatedAt: input.ctx.now,
        lastUpdatedBy: input.msgFrontend.userId,
        name: await PackName.generate({
          count: counted.value,
        }),
        puzzleIds: [],
      }

      const put = await input.ctx.packDb.put(packNew)

      return {
        msgCmd: [
          sendToFrontend(input.msgFrontend, {
            t: 'create-new-pack.created-pack',
            created: put,
          }),
        ],
      }
    }

    default: {
      return {}
    }
  }
}

export const PackCreateNewBackend = {
  update,
}
