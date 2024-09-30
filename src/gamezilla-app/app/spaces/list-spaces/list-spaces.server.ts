import { Result } from 'gamezilla-app/@/core'
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
      const listed = await input.deps.spaceCoreDb.list(input.msgClient)

      const spaces = Result.withDefault(listed, [])

      const started = spaces.map(Space.startFromLatestSnapshot)

      const userIds = spaces.flatMap(Space.toUserIds)

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
