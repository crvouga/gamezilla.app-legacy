import { EventSourced } from '~/@/event-sourced'
import { unwrapOr } from '~/@/result'
import { Paginated } from '~/app/@/data/pagination'
import { sendToClient } from '~/app/@/server/cmd'
import type { SpaceServerModule } from '../@/architecture/space-server'
import { SpaceCore } from '../core/space-core'

//
//
//
// Update
//
//
//

const update: SpaceServerModule['update'] = async (input) => {
  switch (input.msgClient?.t) {
    case 'list-spaces': {
      const listed = await input.ctx.spacesCoreServer.list(input.msgClient)
      const spaces = unwrapOr(listed, Paginated.init())
      const started = spaces.items.map(EventSourced.startFromLatestSnapshot)
      const userIds = spaces.items.flatMap(SpaceCore.toUserIds)
      const profiles = unwrapOr(await input.ctx.profileCache.get(userIds), {})

      return {
        msgCmd: [
          sendToClient(input.msgClient, {
            t: 'listed-spaces',
            spaces: started,
            causedBy: { msgClient: input.msgClient },
            profiles
          })
        ]
      }
    }
  }

  return {}
}

//
//
//
//
//
//

export const ListSpacesServer = {
  update
}
