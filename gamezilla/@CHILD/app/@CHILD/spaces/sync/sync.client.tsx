import { sendToServer } from "gamezilla/@CHILD/app/@SHARED/client"
import { SpaceClientModule } from "../architechure/space-client"
import { Space, Spaces } from "../spaces-core"

const update: SpaceClientModule["update"] = (input) => {
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
