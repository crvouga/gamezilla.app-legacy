import { EventSourced } from '~/@/event-sourced'
import { BackendConnectedEvt } from '~/app/@/frontend/backend-connected-evt'
import { addProfiles, sendToBackend } from '~/app/@/frontend/cmd'
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

const sendMsgSpaceToBackend: SpaceFrontendModule['update'] = ({ ctx, model, msgSpace: msgSpace }) => {
  if (!msgSpace) return { model }

  const spaceEventWithMeta = SpacesCore.toEventWithMeta(model.spaces, msgSpace.spaceId, msgSpace.eventId)

  if (!spaceEventWithMeta) return { model }

  const profile = 'userId' in spaceEventWithMeta ? ctx.profilesByUserId[spaceEventWithMeta.userId] : null

  const profiles = profile ? { [profile.id]: profile } : {}

  return {
    model,
    msgCmd: [sendToBackend({ t: 'sync.got-msg-space', c: spaceEventWithMeta, profilesByUserId: profiles })],
  }
}

const updateProfiles: SpaceFrontendModule['update'] = ({ model, msgBackend }) => {
  if (!msgBackend?.profilesByUserId) return { model }

  return { model, msgCmd: [addProfiles(Object.values(msgBackend.profilesByUserId))] }
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
        msgEvt: [
          {
            t: 'space-evt.synced',
            currentUser: 'currentUser' in input.msgBackend ? input.msgBackend.currentUser : null,
          },
        ],
      }
    }
  }

  return { model: input.model }
}

export const SyncFrontend = {
  update,
}
