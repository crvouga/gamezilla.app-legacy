import { sendToClient } from '~/app/@/server/cmd'
import { GameServerModule } from '~/app/spaces/game/games/@/architecture/game-server-v2'
import type { Pack } from '../../../@/pack/pack'
import { PackId } from '../../../@/pack/pack-id'
import { PackName } from '../../../@/pack/pack-name'
import type { ServerModule } from '../../types'

const update: ServerModule['update'] = async (input) => {
  return GameServerModule.andThen({}, () => updateFromClient(input))
}

const updateFromClient: ServerModule['update'] = async (input) => {
  switch (input.msgClient?.t) {
    case 'create-new-pack.clicked-create-button': {
      const counted = await input.ctx.packDb.count({
        where: {
          createdBy: input.msgClient.userId,
        },
      })

      if (counted.t === 'err') {
        return {}
      }

      const packNew: Pack = {
        createdAt: input.ctx.now,
        createdBy: input.msgClient.userId,
        id: PackId.generate(),
        lastUpdatedAt: input.ctx.now,
        lastUpdatedBy: input.msgClient.userId,
        name: await PackName.generate({
          count: counted.value,
        }),
        puzzleIds: [],
      }

      const put = await input.ctx.packDb.put(packNew)

      return {
        msgCmd: [
          sendToClient(input.msgClient, {
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

export const PackCreateNewServer = {
  update,
}
