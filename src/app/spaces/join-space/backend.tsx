import { EventSourced } from '~/@/event-sourced'
import { Result } from '~/@/result'
import { sendToUser } from '~/app/@/backend/cmd'
import { SpaceBackendModule } from '../architecture/space-backend'

const update: SpaceBackendModule['update'] = (input) => {
  return SpaceBackendModule.andThen({}, () => updateFromMsgSpace({ ...input }))
}

const updateFromMsgSpace: SpaceBackendModule['update'] = async (input) => {
  switch (input.msgSpace?.t) {
    case 'user-joined-space': {
      const space = Result.unwrapOr(await input.ctx.spacesCore.get(input.msgSpace.spaceId), null)

      if (!space) return {}

      const started = EventSourced.startFromLatestSnapshot(space)

      return {
        msgCmd: [
          sendToUser([input.msgSpace.userId], {
            t: 'sync.synced',
            space: started,
            causedBy: { msgSpace: input.msgSpace },
          }),
        ],
      }
    }
  }
  return {}
}

export const JoinSpaceBackend = {
  update,
}
