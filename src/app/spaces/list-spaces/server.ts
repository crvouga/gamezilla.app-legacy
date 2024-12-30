import { EventSourced } from '~/@/event-sourced'
import { unwrapOr } from '~/@/result'
import { Paginated } from '~/app/@/data/pagination'
import type { SpaceServerModule } from '../@/architecture/space-server'
import * as Space from '../core/space-core'
import { sendToClient } from '~/app/@/server/server-cmd'

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
      const userIds = spaces.items.flatMap(Space.toUserIds)
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
