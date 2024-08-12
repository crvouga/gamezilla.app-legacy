import { sendToClient } from 'gamezilla-app/app/@/server'
import { GameServerModule } from 'gamezilla-app/app/spaces/@/architecture/game-server-v2'
import type { FlowPack } from '../../../@/flow-pack/flow-pack'
import { FlowPackId } from '../../../@/flow-pack/flow-pack-id'
import { FlowPackName } from '../../../@/flow-pack/flow-pack-name'
import type { ServerModule } from '../../builder.types'

const update: ServerModule['update'] = async (input) => {
  return GameServerModule.andThen({}, () => updateFromClient(input))
}

const updateFromClient: ServerModule['update'] = async (input) => {
  const { msgClient, ctx, deps } = input

  switch (msgClient?.t) {
    case 'pack-create-new.clicked-create-button': {
      const counted = await deps.flowPackDb.count({
        where: {
          createdBy: msgClient.userId
        }
      })

      if (counted.t === 'err') {
        return {}
      }

      const packNew: FlowPack = {
        createdAt: ctx.now,
        createdBy: msgClient.userId,
        id: FlowPackId.generate(),
        lastUpdatedAt: ctx.now,
        lastUpdatedBy: msgClient.userId,
        name: await FlowPackName.generate({
          count: counted.value
        }),
        puzzleIds: []
      }

      const put = await deps.flowPackDb.put(packNew)

      return {
        msgCmd: [
          sendToClient(msgClient, {
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
