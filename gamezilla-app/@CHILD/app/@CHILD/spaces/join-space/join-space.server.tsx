import { sendToUser } from "gamezilla-app/@CHILD/app/@SHARED/server"
import { SpaceServerModule } from "../architecture/space-server"
import { Space, Spaces } from "../spaces-core"

const update: SpaceServerModule["update"] = (input) => {
  return SpaceServerModule.andThen(
    { model: input.model },
    //
    (model) => updateFromSpaceEvent({ ...input, model }),
  )
}

const updateFromSpaceEvent: SpaceServerModule["update"] = (input) => {
  const { model, msgSpaceEvent } = input
  switch (msgSpaceEvent?.t) {
    case "user-joined-space": {
      const space = Spaces.toSpace(model, msgSpaceEvent.spaceId)

      if (!space) {
        return { model }
      }

      const started = Space.startFromLatestSnapshot(space)

      return {
        model,
        msgCmd: [
          sendToUser([msgSpaceEvent.userId], {
            t: "synced",
            space: started,
            causedBy: msgSpaceEvent.t,
          }),
        ],
      }
    }

    default: {
      return { model: input.model }
    }
  }
}

export const JoinSpaceServer = {
  update,
}
