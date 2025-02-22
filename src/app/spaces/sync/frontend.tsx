import { EventSourced } from '~/@/event-sourced'
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

  const profile = 'userId' in spaceEventWithMeta ? ctx.profiles[spaceEventWithMeta.userId] : null

  const profiles = profile ? { [profile.userId]: profile } : {}

  return { model, msgCmd: [sendToBackend({ t: 'sync.got-msg-space', c: spaceEventWithMeta, profiles })] }
}

const updateProfiles: SpaceFrontendModule['update'] = ({ model, msgBackend }) => {
  if (!msgBackend?.profiles) return { model }

  return { model, msgCmd: [addProfiles(msgBackend.profiles)] }
}

const updateSpace: SpaceFrontendModule['update'] = (input) => {
  switch (input.msgEvt?.t) {
    case 'wire-evt.backend-connected': {
      const currentUserId = input.ctx.currentUser?.userId

      if (!currentUserId) return { model: input.model }

      const currentUserProfile = currentUserId ? input.ctx.profiles[currentUserId] : null

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
            profiles: currentUserProfile ? { [currentUserId]: currentUserProfile } : {},
            causedBy: { msgEvt: input.msgEvt },
          }),
        ],
      }
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
