import { sendToClient } from 'gamezilla-app/app/@/server'
import { GameServerModule } from 'gamezilla-app/app/spaces/game/@/architecture/game-server-v2'
import type { FlowPack } from '../../../@/pack/pack'
import { FlowPackId } from '../../../@/pack/pack-id'
import { FlowPackName } from '../../../@/pack/pack-name'
import type { ServerModule } from '../../builder.types'

const update: ServerModule['update'] = async (input) => {
  return GameServerModule.andThen({}, () => updateFromClient(input))
}

const updateFromClient: ServerModule['update'] = async (input) => {
  switch (input.msgClient?.t) {
    case 'pack-create-new.clicked-create-button': {
      const counted = await input.ctx.flowPackDb.count({
        where: {
          createdBy: input.msgClient.userId
        }
      })

      if (counted.t === 'err') {
        return {}
      }

      const packNew: FlowPack = {
        createdAt: input.ctx.now,
        createdBy: input.msgClient.userId,
        id: FlowPackId.generate(),
        lastUpdatedAt: input.ctx.now,
        lastUpdatedBy: input.msgClient.userId,
        name: await FlowPackName.generate({
          count: counted.value
        }),
        puzzleIds: []
      }

      const put = await input.ctx.flowPackDb.put(packNew)

      return {
        msgCmd: [
          sendToClient(input.msgClient, {
            t: 'pack-create-new.created-pack',
            created: put
          })
        ]
      }
    }

    default: {
      return {}
    }
  }
}

export const PackCreateNewServer = {
  update
}
