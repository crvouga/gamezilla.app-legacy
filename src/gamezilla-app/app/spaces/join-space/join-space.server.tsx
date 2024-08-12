import { sendToUser } from 'gamezilla-app/app/@/server'
import { SpaceServerModule } from '../architecture/space-server'
import { SpaceCore } from '../spaces-core'
import * as SpacesCoreServer from '../spaces-core/spaces-core.server'

const update: SpaceServerModule['update'] = (input) => {
  return SpaceServerModule.andThen(
    {},
    //
    () => updateFromSpaceEvent({ ...input })
  )
}

const updateFromSpaceEvent: SpaceServerModule['update'] = async (input) => {
  const { msgSpaceEvent, deps } = input
  switch (msgSpaceEvent?.t) {
    case 'user-joined-space': {
      const space = await SpacesCoreServer.getSpaceById(deps.spaceCoreDb, msgSpaceEvent.spaceId)

      if (!space) {
        return {}
      }

      const started = SpaceCore.startFromLatestSnapshot(space)

      return {
        msgCmd: [
          sendToUser([msgSpaceEvent.userId], {
            t: 'synced',
            space: started,
            causedBy: { msgSpaceEvent }
          })
        ]
      }
    }

    default: {
      return {}
    }
  }
}

export const JoinSpaceServer = {
  update
}
