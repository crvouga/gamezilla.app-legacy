import { Result } from 'gamezilla-app/@/core'
import { sendToClient } from 'gamezilla-app/app/@/server'
import type { SpaceServerModule } from '../architecture/space-server'
import * as Space from '../spaces-core/space-core'
import * as SpacesCoreServer from '../spaces-core/spaces-core.server'

//
//
//
// Update
//
//
//

const update: SpaceServerModule['update'] = async (input) => {
  const { msgClient, model, deps } = input

  switch (msgClient?.t) {
    case 'list-spaces': {
      const spaces = await SpacesCoreServer.listSpaces({
        spacesDb: input.deps.spaceCoreDb,
        limit: msgClient.limit,
        offset: msgClient.offset,
        where: msgClient.where
      })

      const started = spaces.map(Space.startFromLatestSnapshot)

      const userIds = spaces.flatMap((space) => Space.toUserIds(space))

      const profiles = Result.withDefault(await deps.profileCache.get(userIds), {})

      return {
        model,
        msgCmd: [
          sendToClient(msgClient, {
            t: 'listed-spaces',
            spaces: started,
            causedBy: { msgClient },
            profiles
          })
        ]
      }
    }
  }

  return { model }
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
