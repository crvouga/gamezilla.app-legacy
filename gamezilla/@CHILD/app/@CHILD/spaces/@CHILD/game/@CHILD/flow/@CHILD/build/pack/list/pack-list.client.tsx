import { GameClientModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2"
import { FlowPackListClient } from "../../../../@SHARED/flow-pack-list"
import { ClientModule } from "../../build.core"
import { PackCreateClient } from "../create/pack-create.client"
import { withId } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event"

const update: ClientModule["update"] = (input) => {
  return GameClientModule.chainUpdates(
    { model: input.model },
    //
    (model) => updateClickedPackItem({ ...input, model }),
  )
}

export const updateClickedPackItem: ClientModule["update"] = ({
  msg,
  model,
}) => {
  switch (msg?.t) {
    case "pack-list.clicked-pack-item": {
      return {
        model,
        msgSync: [
          withId({ t: "pack-list.user-clicked-pack-item", pack: msg.pack }),
        ],
      }
    }
    default: {
      return { model }
    }
  }
}

const View: ClientModule["View"] = (input) => {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden">
      <FlowPackListClient.View
        {...input}
        dispatch={(c) => input.dispatch({ t: "flow-pack-list", c })}
        model={input.model.flowPackList}
        slots={{
          fab: () => <PackCreateClient.ViewCreateButton {...input} />,
        }}
        emits={{
          clickedPackItem: (pack) =>
            input.dispatch({ t: "pack-list.clicked-pack-item", pack }),
        }}
      />
    </div>
  )
}

export const PackListClient = {
  View,
  update,
}
