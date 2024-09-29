import { sendToUser } from 'gamezilla-app/app/@/server'
import { SpaceServerModule } from '../architecture/space-server'
import { SpaceCore } from '../spaces-core'
import { SpacesCoreServer } from '../spaces-core/spaces-core-server'

const update: SpaceServerModule['update'] = (input) => {
  return SpaceServerModule.andThen(
    {},
    //
    () => updateFromSpaceEvent({ ...input })
  )
}

const updateFromSpaceEvent: SpaceServerModule['update'] = async (input) => {
  const { msgCoreEvt, deps } = input
  switch (msgCoreEvt?.t) {
    case 'user-joined-space': {
      const space = await SpacesCoreServer.getSpaceById(deps.spaceCoreDb, msgCoreEvt.spaceId)

      if (!space) {
        return {}
      }

      const started = SpaceCore.startFromLatestSnapshot(space)

      return {
        msgCmd: [
          sendToUser([msgCoreEvt.userId], {
            t: 'synced',
            space: started,
            causedBy: {
              msgCoreEvt
            }
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
