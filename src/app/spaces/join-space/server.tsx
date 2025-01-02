import { EventSourced } from '~/@/event-sourced'
import { Result } from '~/@/result'
import { sendToUser } from '~/app/@/server/cmd'
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
      const space = Result.unwrapOr(await input.ctx.spacesCoreServer.get(input.msgCore.spaceId), null)

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
