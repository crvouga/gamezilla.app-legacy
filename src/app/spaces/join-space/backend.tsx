import { EventSourced } from '~/@/event-sourced'
import { Result } from '~/@/result'
import { sendToUser } from '~/app/@/backend/cmd'
import { SpaceBackendModule } from '../@/architecture/space-backend'

const update: SpaceBackendModule['update'] = (input) => {
  return SpaceBackendModule.andThen(
    {},
    //
    () => updateFromSpaceEvent({ ...input }),
  )
}

const updateFromSpaceEvent: SpaceBackendModule['update'] = async (input) => {
  switch (input.msgCore?.t) {
    case 'user-joined-space': {
      const space = Result.unwrapOr(await input.ctx.spacesCoreBackend.get(input.msgCore.spaceId), null)

      if (!space) {
        return {}
      }

      const started = EventSourced.startFromLatestSnapshot(space)

      return {
        msgCmd: [
          sendToUser([input.msgCore.userId], {
            t: 'synced',
            space: started,
            causedBy: { msgCore: input.msgCore },
          }),
        ],
      }
    }

    default: {
      return {}
    }
  }
}

export const JoinSpaceBackend = {
  update,
}
