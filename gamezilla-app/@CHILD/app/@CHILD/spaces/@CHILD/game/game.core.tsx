import { p } from "gamezilla-app/@SHARED/core/parser"
import * as ConnectFour from "./@CHILD/connect-four/connect-four.core"
import * as Flow from "./@CHILD/flow/flow.core"
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

export const GAME_NAME = ["connect-four", "flow"] as const

export const GameName = p.enumeration(GAME_NAME)

export type GameName = p.Infer<typeof GameName>

export const gameNames: { [gameName in GameName]: GameName } = {
  "connect-four": "connect-four",
  flow: "flow",
}

export const isGameName = (x: unknown): x is GameName => {
  return typeof x === "string" && Object.keys(gameNames).includes(x)
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

export const ModelSync = p.custom(
  (_x: unknown): _x is ModelSync => true,
  "Invalid model sync",
)

export type MsgSync =
  | { t: "connect-four"; c: ConnectFour.MsgSync }
  | { t: "flow"; c: Flow.MsgSync }

export const MsgSync = p.custom(
  (_x: unknown): _x is MsgSync => true,
  "Invalid msg sync",
)
