import { EventSourced } from '~/@/event-sourced'
import { AddProfilesCmd } from '~/app/@/frontend/add-profiles-cmd'
import { BackendConnectedEvt } from '~/app/@/frontend/backend-connected-evt'
import { sendToBackend } from '~/app/@/frontend/cmd'
import { SpaceFrontendModule } from '../architecture/space-frontend'
import { SpacesCore } from '../core/core'

const update: SpaceFrontendModule['update'] = (input) => {
  return SpaceFrontendModule.andThen(
    { model: input.model },
    (model) => updateProfiles({ ...input, model }),
    (model) => updateSpace({ ...input, model }),
    (model) => sendMsgSpaceToBackend({ ...input, model }),
    (model) => outputMsgSpacesFromBackend({ ...input, model }),
  )
}

const outputMsgSpacesFromBackend: SpaceFrontendModule['update'] = (input) => {
  switch (input.msgBackend?.t) {
    case 'sync.got-msg-space': {
      return { model: input.model, msgSpace: [input.msgBackend.c] }
    }
  }

  return { model: input.model }
}

const sendMsgSpaceToBackend: SpaceFrontendModule['update'] = (input) => {
  if (!input.msgSpace) return { model: input.model }

  const spaceEventWithMeta = SpacesCore.toEventWithMeta(
    input.model.spaces,
    input.msgSpace.spaceId,
    input.msgSpace.eventId,
  )

  if (!spaceEventWithMeta) return { model: input.model }

  return {
    model: input.model,
    eff() {
      input.ctx.topic.msgSpace.publish(spaceEventWithMeta.spaceId, spaceEventWithMeta)
    },
  }
}

const updateProfiles: SpaceFrontendModule['update'] = ({ model, msgBackend }) => {
  if (!msgBackend?.profilesByUserId) return { model }

  return { model, msgOut: [AddProfilesCmd.init(Object.values(msgBackend.profilesByUserId))] }
}

const updateSpace: SpaceFrontendModule['update'] = (input) => {
  if (BackendConnectedEvt.is(input.msgIn)) {
    const currentUserId = input.ctx.currentUser?.userId

    if (!currentUserId) return { model: input.model }

    const currentUserProfile = currentUserId ? input.ctx.profilesByUserId[currentUserId] : null

    const currentUserSpace = SpacesCore.toSpaceByUserId({
      model: input.model.spaces,
      userId: currentUserId,
    })

    if (!currentUserSpace) return { model: input.model }

    const space = EventSourced.startFromLatestSnapshot(currentUserSpace)

    return {
      model: input.model,
      eff(_dispatch) {
        input.ctx.topic
        debugger
      },
      msgCmd: [
        sendToBackend({
          t: 'sync.sync',
          space,
          profilesByUserId: currentUserProfile ? { [currentUserId]: currentUserProfile } : {},
          causedBy: { msgIn: input.msgIn },
        }),
      ],
    }
  }

  switch (input.msgBackend?.t) {
    case 'sync.synced': {
      const merged = SpacesCore.mergeOne(input.model.spaces, input.msgBackend.space)
      return {
        model: {
          ...input.model,
          spaces: merged,
        },
      }
    }
  }

  return { model: input.model }
}

export const SyncFrontend = {
  update,
}
