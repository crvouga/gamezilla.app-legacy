import { addProfiles, sendToServer } from "gamezilla/@CHILD/app/@SHARED/client"
import { SpaceClientModule } from "../architechure/space-client"
import { Space, Spaces } from "../spaces-core"

const update: SpaceClientModule["update"] = (input) => {
  return SpaceClientModule.chainUpdates(
    { model: input.model },
    (model) => updateProfiles({ ...input, model }),
    (model) => updateSync({ ...input, model }),
    (model) => sendSpaceEventToServer({ ...input, model }),
    (model) => outputSpaceEventsFromServer({ ...input, model }),
  )
}

const outputSpaceEventsFromServer: SpaceClientModule["update"] = (input) => {
  const { model, msgServer } = input

  switch (msgServer?.t) {
    case "event": {
      return {
        model,
        msgSpaceEvent: [msgServer.c],
      }
    }
  }

  return { model }
}

const sendSpaceEventToServer: SpaceClientModule["update"] = ({
  ctx,
  model,
  msgSpaceEvent,
}) => {
  if (!msgSpaceEvent) {
    return { model }
  }

  const msgEvtWithMeta = Spaces.toEventWithMeta(
    model,
    msgSpaceEvent.spaceId,
    msgSpaceEvent.eventId,
  )

  if (!msgEvtWithMeta) {
    return { model }
  }

  const profile =
    "userId" in msgEvtWithMeta ? ctx.profiles[msgEvtWithMeta.userId] : null

  const profiles = profile ? { [profile.userId]: profile } : {}

  return {
    model,
    msgCmd: [sendToServer({ t: "event", c: msgEvtWithMeta, profiles })],
  }
}

const updateProfiles: SpaceClientModule["update"] = ({ model, msgServer }) => {
  if (msgServer?.profiles) {
    return {
      model,
      msgCmd: [addProfiles(msgServer.profiles)],
    }
  }

  return { model }
}

const updateSync: SpaceClientModule["update"] = (input) => {
  const { model, msgEvt, msgServer } = input

  switch (msgEvt?.t) {
    case "wire/server-connected": {
      const currentUserId = input.ctx.currentUserId

      if (!currentUserId) {
        return { model }
      }

      const currentUserProfile = currentUserId
        ? input.ctx.profiles[currentUserId]
        : null

      const currentUserSpace = Spaces.toSpaceByUserId({
        model,
        userId: currentUserId,
      })

      if (!currentUserSpace) {
        return { model }
      }

      const started = Space.startFromLatestSnapshot(currentUserSpace)

      return {
        model: {
          ...model,
          isSyncing: true,
        },
        msgCmd: [
          sendToServer({
            t: "sync",
            space: started,
            profiles: currentUserProfile
              ? { [currentUserId]: currentUserProfile }
              : {},
            causedBy: msgEvt.t,
          }),
        ],
      }
    }
  }

  switch (msgServer?.t) {
    case "synced":
    case "current-user-space": {
      const merged = Spaces.mergeOne({ model, space: msgServer.space })
      return {
        model: { ...model, ...merged },
      }
    }
  }

  return { model }
}

export const SyncClient = {
  update,
}
