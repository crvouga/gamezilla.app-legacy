import { sendToUser } from 'gamezilla-app/app/@/server'
import { SpaceServerModule } from '../@/architecture/space-server'
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
  switch (input.msgCoreEvt?.t) {
    case 'user-joined-space': {
      const space = await SpacesCoreServer.getSpaceById(input.deps.spaceCoreDb, input.msgCoreEvt.spaceId)

      if (!space) {
        return {}
      }

      const started = SpaceCore.startFromLatestSnapshot(space)

      return {
        msgCmd: [
          sendToUser([input.msgCoreEvt.userId], {
            t: 'synced',
            space: started,
            causedBy: { msgCoreEvt: input.msgCoreEvt }
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
