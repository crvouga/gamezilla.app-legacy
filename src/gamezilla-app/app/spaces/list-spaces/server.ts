import { Result } from '@/core'
import { EventSourced } from '@/event-sourced'
import { Paginated } from 'gamezilla-app/app/@/data'
import { sendToClient } from 'gamezilla-app/app/@/server'
import type { SpaceServerModule } from '../@/architecture/space-server'
import * as Space from '../core/space-core'

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

      const spaces = Result.unwrapOr(listed, Paginated.init())

      const started = spaces.items.map(EventSourced.startFromLatestSnapshot)
      const userIds = spaces.items.flatMap(Space.toUserIds)
      const profiles = Result.unwrapOr(await input.ctx.profileCache.get(userIds), {})

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
