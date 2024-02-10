import { SpaceCtx } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space"
import { UserId } from "gamezilla/@CHILD/app/@SHARED/data"
import { WithEventMeta } from "../../../../@SHARED/event"
import * as Play from "./@CHILD/play/play.core"
import * as Builder from "./@CHILD/builder/builder.core"
import { FlowPuzzle } from "./@SHARED/flow-puzzle/flow-puzzle"
import { FlowPuzzleId } from "./@SHARED/flow-puzzle/flow-puzzle-id"

//
//
// Model
//
//

export type BaseModelClient = {
    puzzles: {
        [flowPuzzleId: FlowPuzzleId]: FlowPuzzle
    }
}

export type VariantModelClient =
    | { t: "none" }
    | { t: "builder"; c: Builder.ModelClient }
    | { t: "play"; c: Play.ModelClient }

export type ModelClient = BaseModelClient & VariantModelClient

export type ModelServer =
    | { t: "none" }
    | { t: "builder"; c: Builder.ModelServer }
    | { t: "play"; c: Play.ModelServer }

//
//
// Msg
//
//

export type MsgClient =
    | { t: "msgGame"; c: MsgGame }
    | { t: "builder"; c: Builder.MsgClient }
    | { t: "play"; c: Play.MsgClient }

export type MsgServer =
    | { t: "builder"; c: Builder.MsgServer }
    | { t: "play"; c: Play.MsgServer }

export type MsgToServer =
    | { t: "builder"; c: Builder.MsgToServer }
    | { t: "play"; c: Play.MsgToServer }

export type MsgToClient =
    | { t: "builder"; c: Builder.MsgToClient }
    | { t: "play"; c: Play.MsgToClient }

export type Mode = "builder" | "play"

//
//
//
//
//
//
//

export type MsgGame =
    | { t: "user-changed-mode"; mode: Mode | null; userId: UserId }
    | { t: "play"; c: Play.MsgGame }
    | { t: "builder"; c: Builder.MsgGame }

export type ModelGame =
    | { t: null }
    | { t: "builder"; c: Builder.ModelGame }
    | { t: "play"; c: Play.ModelGame }

export const initGame = () => {
    return { t: null }
}

export const reducer = ({
    ctx,
    msgGame,
    modelGame,
}: {
    ctx: SpaceCtx
    msgGame: WithEventMeta<MsgGame>
    modelGame: ModelGame
}): ModelGame => {
    switch (msgGame.t) {
        case "play": {
            switch (modelGame.t) {
                case "play": {
                    return {
                        t: "play",
                        c: Play.reducer({
                            ctx,
                            msgGame: msgGame.c,
                            modelGame: modelGame.c,
                        }),
                    }
                }
                default: {
                    return modelGame
                }
            }
        }

        case "builder": {
            switch (modelGame.t) {
                case "builder": {
                    return {
                        t: "builder",
                        c: Builder.reducer({
                            ctx,
                            msgGame: msgGame.c,
                            modelGame: modelGame.c,
                        }),
                    }
                }
                default: {
                    return modelGame
                }
            }
        }

        case "user-changed-mode": {
            if (msgGame.userId !== ctx.space.hostId) {
                return modelGame
            }

            switch (msgGame.mode) {
                case null: {
                    return { t: null }
                }

                case "play": {
                    return {
                        t: "play",
                        c: Play.initGame({ ctx }),
                    }
                }

                case "builder": {
                    return {
                        t: "builder",
                        c: Builder.initGame({ ctx }),
                    }
                }
            }
        }
    }
}
