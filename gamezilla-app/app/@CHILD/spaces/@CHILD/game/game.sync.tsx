import { EventMeta } from "gamezilla-app/app/@CHILD/spaces/@SHARED/event"
import { SpaceCtx } from "../../@SHARED/space"
import * as ConnectFour from "./@CHILD/connect-four/connect-four.core"
import * as Flow from "./@CHILD/flow/flow.sync"
import { GameName, ModelSync, MsgSync } from "./game.core"

export const initSync = (gameName: GameName): ModelSync => {
  switch (gameName) {
    case "connect-four": {
      return {
        t: "connect-four",
        c: ConnectFour.initSync(),
      }
    }

    case "flow": {
      return {
        t: "flow",
        c: Flow.initSync(),
      }
    }
  }
}

export const reducer = ({
  ctx,
  modelSync,
  msgSync,
}: {
  ctx: SpaceCtx
  modelSync: ModelSync
  msgSync: MsgSync & EventMeta
}): ModelSync => {
  switch (modelSync.t) {
    case "connect-four": {
      switch (msgSync.t) {
        case "connect-four": {
          return {
            t: "connect-four",
            c: ConnectFour.reducer({
              ctx,
              msgSync: { ...msgSync, ...msgSync.c },
              modelSync: modelSync.c,
            }),
          }
        }
        default: {
          return modelSync
        }
      }
    }

    case "flow": {
      switch (msgSync.t) {
        case "flow": {
          return {
            t: "flow",
            c: Flow.reducer({
              ctx,
              msgSync: { ...msgSync, ...msgSync.c },
              modelSync: modelSync.c,
            }),
          }
        }

        default: {
          return modelSync
        }
      }
    }
  }
}
