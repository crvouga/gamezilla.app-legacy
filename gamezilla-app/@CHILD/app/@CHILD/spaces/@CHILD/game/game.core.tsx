import { EventMeta } from "gamezilla-app/@CHILD/app/@CHILD/spaces/@SHARED/event"
import { SpaceCtx } from "../../@SHARED/space"
import * as Flow from "./@CHILD/flow/flow.core"
import * as ConnectFour from "./@CHILD/connect-four/connect-four.core"
//
//
//
// Model
//
//
//

export type ModelClient =
  | { t: "connect-four"; c: ConnectFour.ModelClient }
  | { t: "flow"; c: Flow.ModelClient }

export type ModelServer =
  | { t: "connect-four"; c: ConnectFour.ModelServer }
  | { t: "flow"; c: Flow.ModelServer }

//
//
//
// Msg
//
//
//

export type MsgServer =
  | { t: "connect-four"; c: ConnectFour.MsgServer }
  | { t: "flow"; c: Flow.MsgServer }

export type MsgClient =
  | { t: "connect-four"; c: ConnectFour.MsgClient }
  | { t: "flow"; c: Flow.MsgClient }

export type MsgToClient =
  | { t: "connect-four"; c: ConnectFour.MsgToClient }
  | { t: "flow"; c: Flow.MsgToClient }

export type MsgToServer =
  | { t: "connect-four"; c: ConnectFour.MsgToServer }
  | { t: "flow"; c: Flow.MsgToServer }

//
//
//
// Game Name
//
//
//

export type GameName = "connect-four" | "flow"

export const gameNames: { [gameName in GameName]: GameName } = {
  "connect-four": "connect-four",
  flow: "flow",
}

export const gameNameList: GameName[] = [
  // "connect-four",
  "flow",
]

export const gameNameToString = (gameName: GameName): string => {
  switch (gameName) {
    case "connect-four": {
      return "Connect Four"
    }

    case "flow": {
      return "Flow"
    }
  }
}

export type ModelSync =
  | {
      t: "connect-four"
      c: ConnectFour.ModelSync
    }
  | {
      t: "flow"
      c: Flow.ModelSync
    }

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

export type MsgSync =
  | { t: "connect-four"; c: ConnectFour.MsgSync }
  | { t: "flow"; c: Flow.MsgSync }

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
