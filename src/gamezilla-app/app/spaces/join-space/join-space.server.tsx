import { Result } from 'gamezilla-app/@/core'
import { sendToUser } from 'gamezilla-app/app/@/server'
import { SpaceServerModule } from '../@/architecture/space-server'
import { SpaceCore } from '../spaces-core'

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
      const space = Result.unwrapOr(await input.deps.spacesCoreServer.get(input.msgCoreEvt.spaceId), null)

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
