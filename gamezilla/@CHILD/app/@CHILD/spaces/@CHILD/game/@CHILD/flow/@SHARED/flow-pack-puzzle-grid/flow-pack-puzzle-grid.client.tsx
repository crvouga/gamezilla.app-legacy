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

export const FlowPackPuzzleGridClient: Pick<ClientModule, "View" | "update"> = {
  update(input) {
    return { model: input.model }
  },
  View(input) {
    return (
      <>
        {input.slots?.grid({
          request: input.model.request,
        })}
      </>
    )
  },
}
