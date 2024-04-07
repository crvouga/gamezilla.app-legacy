import { SpaceServerModule } from "../architecture/space-server"

const update: SpaceServerModule["update"] = (input) => {
  return SpaceServerModule.andThen(
    { model: input.model },
    //
    (model) => updateFromSpaceEvent({ ...input, model }),
  )
}

const updateFromSpaceEvent: SpaceServerModule["update"] = ({
  model,
  msgSpaceEvent,
}) => {
  switch (msgSpaceEvent?.t) {
    case "user-started-space": {
      return { model }
    }
    default: {
      return { model }
    }
  }
}

export const StartSpaceServer = {
  update,
}
