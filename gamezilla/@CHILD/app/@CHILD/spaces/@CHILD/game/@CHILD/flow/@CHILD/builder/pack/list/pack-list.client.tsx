import { GameClientModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2"
import { FlowPackListClient } from "../../../../@SHARED/flow-pack-list"
import { ClientModule } from "../../builder.core"
import { PackCreateClient } from "../create/pack-create.client"

export const update: ClientModule["update"] = (input) => {
  return GameClientModule.chainUpdates(
    { model: input.model },
    //
  )
}

export const View: ClientModule["View"] = (input) => {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center">
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
