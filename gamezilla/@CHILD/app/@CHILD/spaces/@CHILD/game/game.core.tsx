import { EventMeta } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event"
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

export const gameNameList: GameName[] = ["connect-four", "flow"]

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

export type ModelGame =
    | {
          t: "connect-four"
          c: ConnectFour.ModelGame
      }
    | {
          t: "flow"
          c: Flow.ModelGame
      }

export const initGame = (gameName: GameName): ModelGame => {
    switch (gameName) {
        case "connect-four": {
            return {
                t: "connect-four",
                c: ConnectFour.initGame(),
            }
        }

        case "flow": {
            return {
                t: "flow",
                c: Flow.initGame(),
            }
        }
    }
}

export type MsgGame =
    | { t: "connect-four"; c: ConnectFour.MsgGame }
    | { t: "flow"; c: Flow.MsgGame }

export const reducer = ({
    ctx,
    modelGame,
    msgGame,
}: {
    ctx: SpaceCtx
    modelGame: ModelGame
    msgGame: MsgGame & EventMeta
}): ModelGame => {
    switch (modelGame.t) {
        case "connect-four": {
            switch (msgGame.t) {
                case "connect-four": {
                    return {
                        t: "connect-four",
                        c: ConnectFour.reducer({
                            ctx,
                            msgGame: { ...msgGame, ...msgGame.c },
                            modelGame: modelGame.c,
                        }),
                    }
                }
                default: {
                    return modelGame
                }
            }
        }

        case "flow": {
            switch (msgGame.t) {
                case "flow": {
                    return {
                        t: "flow",
                        c: Flow.reducer({
                            ctx,
                            msgGame: { ...msgGame, ...msgGame.c },
                            modelGame: modelGame.c,
                        }),
                    }
                }

                default: {
                    return modelGame
                }
            }
        }
    }
}
