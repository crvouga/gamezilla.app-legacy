import { EventSourced } from '~/@/event-sourced'
import { addProfiles, sendToBackend } from '~/app/@/frontend/cmd'
import { SpaceFrontendModule } from '../@/architecture/space-frontend'
import { SpaceFrontend } from '../space/frontend'

const update: SpaceFrontendModule['update'] = (input) => {
  return SpaceFrontendModule.andThen(
    { model: input.model },
    (model) => updateProfiles({ ...input, model }),
    (model) => updateSpace({ ...input, model }),
    (model) => sendSpaceEventToBackend({ ...input, model }),
    (model) => outputSpaceEventsFromBackend({ ...input, model }),
  )
}

const outputSpaceEventsFromBackend: SpaceFrontendModule['update'] = (input) => {
  switch (input.msgBackend?.t) {
    case 'got-msg-space': {
      return {
        model: input.model,
        msgSpace: [input.msgBackend.c],
      }
    }
  }

  return { model: input.model }
}

const sendSpaceEventToBackend: SpaceFrontendModule['update'] = ({ ctx, model, msgSpace: msgSpace }) => {
  if (!msgSpace) {
    return { model }
  }

  const spaceEventWithMeta = SpaceFrontend.toEventWithMeta(model, msgSpace.spaceId, msgSpace.eventId)

  if (!spaceEventWithMeta) {
    return { model }
  }

  const profile = 'userId' in spaceEventWithMeta ? ctx.profiles[spaceEventWithMeta.userId] : null

  const profiles = profile ? { [profile.userId]: profile } : {}

  return {
    model,
    msgCmd: [sendToBackend({ t: 'got-msg-space', c: spaceEventWithMeta, profiles })],
  }
}

const updateProfiles: SpaceFrontendModule['update'] = ({ model, msgBackend }) => {
  if (msgBackend?.profiles) {
    return {
      model,
      msgCmd: [addProfiles(msgBackend.profiles)],
    }
  }

  return { model }
}

const updateSpace: SpaceFrontendModule['update'] = (input) => {
  const { model, msgEvt, msgBackend } = input

  switch (msgEvt?.t) {
    case 'wire-evt.backend-connected': {
      const currentUserId = input.ctx.currentUserId

      if (!currentUserId) {
        return {
          model,
        }
      }

      const currentUserProfile = currentUserId ? input.ctx.profiles[currentUserId] : null

      const currentUserSpace = SpaceFrontend.toSpaceByUserId({
        model,
        userId: currentUserId,
      })

      if (!currentUserSpace) {
        return {
          model,
        }
      }

      const started = EventSourced.startFromLatestSnapshot(currentUserSpace)

      return {
        model,
        msgCmd: [
          sendToBackend({
            t: 'sync',
            space: started,
            profiles: currentUserProfile
              ? {
                  [currentUserId]: currentUserProfile,
                }
              : {},
            causedBy: { msgEvt },
          }),
        ],
      }
    }
  }

  switch (msgBackend?.t) {
    case 'synced':
    case 'current-user-space': {
      const merged = SpaceFrontend.merge(model, msgBackend.space)
      return {
        model: {
          ...model,
          ...merged,
        },
        msgEvt: [
          {
            t: 'space-evt.synced',
            currentUser: 'currentUser' in msgBackend ? msgBackend.currentUser : null,
          },
        ],
      }
    }
  }

  return { model }
}

export const SyncFrontend = {
  update,
}
