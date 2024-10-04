import { Result } from 'gamezilla-app/@/core'
import { Paginated } from 'gamezilla-app/app/@/data'
import { sendToClient } from 'gamezilla-app/app/@/server'
import type { SpaceServerModule } from '../@/architecture/space-server'
import * as Space from '../spaces-core/space-core'

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
      const listed = await input.deps.spacesCoreServer.list(input.msgClient)

      const spaces = Result.withDefault(listed, Paginated.init())

      const started = spaces.items.map(Space.startFromLatestSnapshot)
      const userIds = spaces.items.flatMap(Space.toUserIds)
      const profiles = Result.withDefault(await input.deps.profileCache.get(userIds), {})

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
