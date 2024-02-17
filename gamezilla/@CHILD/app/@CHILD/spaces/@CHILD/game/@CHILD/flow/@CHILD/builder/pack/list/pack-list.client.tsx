import { IntersectionObserverEmitter } from "gamezilla/@CHILD/app/@SHARED/ui/intersection-observer"
import { ClientModule } from "../../builder.core"
import { PackCreateClient } from "../create/pack-create.client"
import { RequestResponse } from "gamezilla/@SHARED/core"
import { GameClientModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2"
import { FlowPackListClient } from "../../../../@SHARED/flow-pack-list"

const UserObsertvedEndOfList: Pick<ClientModule, "update" | "View"> = {
  update(input) {
    switch (input.msg?.t) {
      case "pack-list.user-observed-end-of-list": {
        return {
          model: {
            ...input.model,
            packListRequest: RequestResponse.requesting(input.ctx.now),
          },
        }
      }
    }
    return { model: input.model }
  },
  View(input) {
    return (
      <IntersectionObserverEmitter
        id="pack-list-user-observed-end-of-list"
        onVisible={() =>
          input.dispatch({ t: "pack-list.user-observed-end-of-list" })
        }
      />
    )
  },
}

export const update: ClientModule["update"] = (input) => {
  return GameClientModule.chainUpdates(
    { model: input.model },
    //
    (model) => UserObsertvedEndOfList.update({ ...input, model }),
  )
}

export const View: ClientModule["View"] = (input) => {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center">
      <FlowPackListClient.View
        {...input}
        dispatch={(c) => input.dispatch({ t: "flow-pack-list", c })}
        model={input.model.flowPackList}
      />
      <div className="absolute bottom-5 right-5 bg-black">
        <PackCreateClient.ViewCreateButton {...input} />
      </div>
    </div>
  )
}

export const PackListClient = {
  View,
  update,
}
