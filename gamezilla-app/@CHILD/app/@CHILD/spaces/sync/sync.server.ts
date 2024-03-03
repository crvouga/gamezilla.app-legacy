import { sendToClient } from "gamezilla-app/@CHILD/app/@SHARED/server"
import { AppServerModule } from "../../../@SHARED/architecture/app-server"
import { SpaceServerModule } from "../architecture/space-server"
import * as Space from "../spaces-core/space"
import * as Spaces from "../spaces-core/spaces"
import { MsgToClient, spacesToProfiles } from "../spaces.core"

//
//
//
//
//
//
//

const updateProfileCache: SpaceServerModule["update"] = async (input) => {
  return {
    model: {
      ...input.model,
      profileCache: {
        ...input.model.profileCache,
        ...input.msgClient?.profiles,
      },
    },
  }
}

const updateSync: SpaceServerModule["update"] = async (input) => {
  const { msgClient, model } = input

  switch (msgClient?.t) {
    case "sync": {
      return AppServerModule.andThen(
        { model },
        (model) => {
          const merged = Spaces.mergeOne({
            model,
            space: msgClient.space,
          })

          return {
            model: {
              errors: {},
              games: model.games,
              profileCache: model.profileCache,
              spaceIdByUserId: merged.spaceIdByUserId,
              spaces: merged.spaces,
            },
          }
        },
        (model) => {
          const spaceId = Space.toSpaceId(msgClient.space)

          if (!spaceId) {
            return { model }
          }

          const spaceNew = Spaces.toSpace(model, spaceId)

          if (!spaceNew) {
            return { model }
          }

          const profiles = spacesToProfiles(model, [spaceNew])

          const starting = Space.startFromLatestSnapshot(spaceNew)

          return {
            model,
            msgCmd: [
              sendToClient<MsgToClient>([msgClient.clientId], {
                t: "synced",
                causedBy: msgClient.t,
                space: starting,
                profiles: profiles,
              }),
            ],
          }
        },
      )
    }
    default: {
      return { model }
    }
  }
}

const updateCurrentUserSpace: SpaceServerModule["update"] = async (input) => {
  const { msgEvt, model } = input

  switch (msgEvt?.t) {
    case "auth/client-authenticated": {
      const space = Spaces.toSpaceByUserId({
        model,
        userId: msgEvt.userId,
      })

      if (!space) {
        return { model }
      }

      const profiles = spacesToProfiles(model, [space])

      const started = Space.startFromLatestSnapshot(space)

      return {
        model,
        msgCmd: [
          sendToClient<MsgToClient>([msgEvt.clientId], {
            t: "current-user-space",
            space: started,
            profiles,
            causedBy: msgEvt.t,
          }),
        ],
      }
    }

    default: {
      return { model }
    }
  }
}

const update: SpaceServerModule["update"] = async (input) => {
  return SpaceServerModule.andThen(
    { model: input.model },
    (model) => updateSync({ ...input, model }),
    (model) => updateCurrentUserSpace({ ...input, model }),
    (model) => updateProfileCache({ ...input, model }),
  )
}

export const SyncServer = {
  update,
}
