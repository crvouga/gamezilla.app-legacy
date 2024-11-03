import { Result } from 'gamezilla-app/@/core'
import { EventSourced } from 'gamezilla-app/@/event-sourced'
import { sendToUser } from 'gamezilla-app/app/@/server'
import { SpaceServerModule } from '../@/architecture/space-server'

const update: SpaceServerModule['update'] = (input) => {
  return SpaceServerModule.andThen(
    {},
    //
    () => updateFromSpaceEvent({ ...input })
  )
}

const updateFromSpaceEvent: SpaceServerModule['update'] = async (input) => {
  switch (input.msgCore?.t) {
    case 'user-joined-space': {
      const space = Result.unwrapOr(await input.deps.spacesCoreServer.get(input.msgCore.spaceId), null)

      if (!space) {
        return {}
      }

      const started = EventSourced.startFromLatestSnapshot(space)

      return {
        msgCmd: [
          sendToUser([input.msgCore.userId], {
            t: 'synced',
            space: started,
            causedBy: { msgCore: input.msgCore }
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
