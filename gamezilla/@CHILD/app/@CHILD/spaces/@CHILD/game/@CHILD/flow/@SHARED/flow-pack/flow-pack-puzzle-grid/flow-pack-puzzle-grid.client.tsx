import {
  SpaceClientCtx,
  SpaceClientEvent,
} from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space"
import { SpaceClientCmd } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space-client-cmd"
import { AppClientModule } from "gamezilla/@CHILD/app/@SHARED/architecture/app-client"
import {
  ModelClient,
  MsgClient,
  MsgToClient,
  MsgToServer,
} from "./flow-pack-puzzle-grid.core"
import { RequestResponse } from "gamezilla/@SHARED/core"
import { IntersectionObserverEmitter } from "gamezilla/@CHILD/app/@SHARED/ui/intersection-observer"
import { sendToServer } from "gamezilla/@CHILD/app/@SHARED/client"

type ClientModule = AppClientModule<{
  Ctx: SpaceClientCtx
  Model: ModelClient
  ModelLocation: null
  Msg: MsgClient
  MsgInCmd: null
  MsgInEvent: SpaceClientEvent
  MsgOutCmd: SpaceClientCmd<{
    MsgClient: MsgClient
    MsgToServer: MsgToServer
  }>
  MsgOutEvent: null
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
  ViewSlot: {
    grid: {
      request: RequestResponse<string, null>
    }
  }
}>

const ObserveGrid: Pick<ClientModule, "View" | "update"> = {
  update(input) {
    switch (input.msg?.t) {
      case "user-observed-grid": {
        return {
          model: input.model,
          msgCmd: [sendToServer({ t: "user-observed-grid" })],
        }
      }
    }
    return { model: input.model }
  },
  View(input) {
    return (
      <IntersectionObserverEmitter
        id="flow-pack-puzzle-grid"
        onVisible={() => input.dispatch({ t: "user-observed-grid" })}
      />
    )
  },
}

export const FlowPackPuzzleGridClient: Pick<ClientModule, "View" | "update"> = {
  update(input) {
    return AppClientModule.chainUpdates(
      { model: input.model },
      (model) => ObserveGrid.update({ ...input, model }),
      //
    )
  },
  View(input) {
    return (
      <>
        {input.slots?.grid({
          request: input.model.request,
        })}
        <ObserveGrid.View {...input} />
      </>
    )
  },
}
