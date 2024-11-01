import { addProfiles, sendToServer } from 'gamezilla-app/app/@/client'
import { SpaceClientModule } from '../@/architecture/space-client'
import { SpaceCore } from '../spaces-core'
import * as SpacesCoreClient from '../spaces-core/spaces-core-client/spaces-core.client'

const update: SpaceClientModule['update'] = (input) => {
  return SpaceClientModule.andThen(
    { model: input.model },
    (model) => updateProfiles({ ...input, model }),
    (model) => updateCore({ ...input, model }),
    (model) => sendSpaceEventToServer({ ...input, model }),
    (model) => outputSpaceEventsFromServer({ ...input, model })
  )
}

const outputSpaceEventsFromServer: SpaceClientModule['update'] = (input) => {
  switch (input.msgServer?.t) {
    case 'event': {
      return {
        model: input.model,
        msgCore: [input.msgServer.c]
      }
    }
  }

  return { model: input.model }
}

const sendSpaceEventToServer: SpaceClientModule['update'] = ({ ctx, model, msgCore: msgCore }) => {
  if (!msgCore) {
    return { model }
  }

  const spaceEventWithMeta = SpacesCoreClient.toEventWithMeta(model, msgCore.spaceId, msgCore.eventId)

  if (!spaceEventWithMeta) {
    return { model }
  }

  const profile = 'userId' in spaceEventWithMeta ? ctx.profiles[spaceEventWithMeta.userId] : null

  const profiles = profile ? { [profile.userId]: profile } : {}

  return {
    model,
    msgCmd: [sendToServer({ t: 'event', c: spaceEventWithMeta, profiles })]
  }
}

const updateProfiles: SpaceClientModule['update'] = ({ model, msgServer }) => {
  if (msgServer?.profiles) {
    return {
      model,
      msgCmd: [addProfiles(msgServer.profiles)]
    }
  }

  return { model }
}

const updateCore: SpaceClientModule['update'] = (input) => {
  const { model, msgEvt, msgServer } = input

  switch (msgEvt?.t) {
    case 'wire/server-connected': {
      const currentUserId = input.ctx.currentUserId

      if (!currentUserId) {
        return {
          model
        }
      }

      const currentUserProfile = currentUserId ? input.ctx.profiles[currentUserId] : null

      const currentUserSpace = SpacesCoreClient.toSpaceByUserId({
        model,
        userId: currentUserId
      })

      if (!currentUserSpace) {
        return {
          model
        }
      }

      const started = SpaceCore.startFromLatestSnapshot(currentUserSpace)

      return {
        model: {
          ...model,
          isSycing: true
        },
        msgCmd: [
          sendToServer({
            t: 'sync',
            space: started,
            profiles: currentUserProfile
              ? {
                  [currentUserId]: currentUserProfile
                }
              : {},
            causedBy: { msgEvt }
          })
        ]
      }
    }
  }

  switch (msgServer?.t) {
    case 'synced':
    case 'current-user-space': {
      const merged = SpacesCoreClient.mergeOne({
        model,
        space: msgServer.space
      })
      return {
        model: {
          ...model,
          ...merged
        },
        msgEvt: [
          {
            t: 'space/synced',
            currentUser: 'currentUser' in msgServer ? msgServer.currentUser : null
          }
        ]
      }
    }
  }

  return { model }
}

export const SyncClient = {
  update
}
