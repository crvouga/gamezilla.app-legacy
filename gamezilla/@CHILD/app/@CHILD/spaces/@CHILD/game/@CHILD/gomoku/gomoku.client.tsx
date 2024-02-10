import { MainMenuScreen } from "gamezilla/@CHILD/app/@CHILD/spaces/@CHILD/game/@SHARED/game"
import { SpaceClientCtx } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space"
import { ClientCtx } from "gamezilla/@CHILD/app/@SHARED/client"
import { Eff, Sub } from "gamezilla/@SHARED/core"
import * as VsBot from "./@CHILD/vs-bot/vs-bot.client"
import * as VsUser from "./@CHILD/vs-user/vs-user.client"
import { CoverArt } from "./@SHARED/gomoku/gomoku-ui"
import { ModelClient, MsgClient, ModelServer, MsgToClient } from "./gomoku.core"

//
//
//
// model
//
//
//

export type Model = ModelClient

export const init: Model = {
    t: "none",
}

//
//
//
// update
//
//
//

export type Msg = MsgClient

export const update = ({
    ctx,
    msg,
    model,
}: {
    ctx: SpaceClientCtx
    msg: Msg
    model: Model
}): {
    model: Model
    eff?: Eff<Msg>
} => {
    if (msg.t === "input-mode") {
        return { model }
    }

    if (model.t === "vs-bot" && msg.t === "vs-bot") {
        const updated = VsBot.update({
            ctx,
            msg: msg.c,
            model: model.c,
        })
        return {
            model: { t: "vs-bot", c: updated.model },
            eff: Eff.tag("vs-bot", updated.eff),
        }
    }

    if (model.t === "vs-user" && msg.t === "vs-user") {
        const updated = VsUser.update({
            msg: msg.c,
            model: model.c,
        })
        return {
            model: { t: "vs-user", c: updated.model },
            eff: Eff.tag("vs-user", updated.eff),
        }
    }

    return { model }
}

export const updateFromServer = ({
    ctx,
    model,
    msg,
}: {
    ctx: SpaceClientCtx
    msg: MsgToClient
    model: Model
}): {
    model: Model
    eff?: Eff<Msg>
} => {
    if (msg.t === "input-mode") {
        if (msg.result.t === "err") {
            return { model }
        }
        const merged = mergeWithServer({
            ctx,
            clientModel: model,
            serverModel: msg.result.value,
        })
        return { model: merged }
    }

    if (model.t === "vs-bot" && msg.t === "vs-bot") {
        const updated = VsBot.updateFromServer({
            ctx,
            msg: msg.c,
            model: model.c,
        })
        return {
            model: { t: "vs-bot", c: updated.model },
            eff: Eff.tag("vs-bot", updated.eff),
        }
    }

    if (model.t === "vs-user" && msg.t === "vs-user") {
        const updated = VsUser.updateFromServer({
            model: model.c,
            msg: msg.c,
        })
        return {
            model: { t: "vs-user", c: updated.model },
            eff: Eff.tag("vs-user", updated.eff),
        }
    }

    return { model }
}

export const mergeWithServer = ({
    ctx,
    clientModel,
    serverModel,
}: {
    ctx: ClientCtx
    clientModel: ModelClient
    serverModel: ModelServer
}): ModelClient => {
    switch (serverModel.t) {
        case "none": {
            return { t: "none" }
        }

        case "vs-bot": {
            if (clientModel.t === "vs-bot") {
                return {
                    t: "vs-bot",
                    c: VsBot.mergeWithServer({
                        ctx,
                        clientModel: clientModel.c,
                        serverModel: serverModel.c,
                    }),
                }
            }
            return {
                t: "vs-bot",
                c: VsBot.mergeWithServer({
                    ctx,
                    clientModel: VsBot.init({ userId: null }),
                    serverModel: serverModel.c,
                }),
            }
        }

        case "vs-user": {
            if (clientModel.t === "vs-user") {
                return {
                    t: "vs-user",
                    c: VsUser.mergeWithServer({
                        clientModel: clientModel.c,
                        serverModel: serverModel.c,
                    }),
                }
            }
            return {
                t: "vs-user",
                c: VsUser.mergeWithServer({
                    clientModel: VsUser.init({ white: null, black: null }),
                    serverModel: serverModel.c,
                }),
            }
        }
    }
}

//
//
//
// subscriptions
//
//
//

export const subscriptions = (ctx: ClientCtx, model: Model): Sub<Msg> => {
    switch (model.t) {
        case "vs-bot": {
            return Sub.tag("vs-bot", VsBot.subscriptions(ctx, model.c))
        }

        case "vs-user": {
            return Sub.None
        }

        case "none": {
            return Sub.None
        }
    }
}

//
//
//
// view
//
//
//

export const view = ({
    model,
    ctx,
    spaceCtx,
    dispatch,
}: {
    model: Model
    ctx: ClientCtx
    spaceCtx: SpaceClientCtx
    dispatch: (m: Msg) => void
}) => {
    switch (model.t) {
        case "none": {
            return (
                <MainMenuScreen.View
                    title="Gomoku"
                    renderCoverArt={(props) => <CoverArt {...props} />}
                    ctx={spaceCtx}
                    buttons={[
                        MainMenuScreen.buttons.playComputer({
                            onClick: () =>
                                dispatch({
                                    t: "input-mode",
                                    userId: ctx.currentUserId,
                                    mode: "vs-bot",
                                }),
                        }),

                        MainMenuScreen.buttons.playFriend({
                            onClick: () =>
                                dispatch({
                                    t: "input-mode",
                                    userId: ctx.currentUserId,
                                    mode: "vs-user",
                                }),
                        }),
                    ]}
                />
            )
        }

        case "vs-bot": {
            return (
                <VsBot.View
                    model={model.c}
                    ctx={ctx}
                    onBack={() =>
                        dispatch({
                            t: "input-mode",
                            mode: "none",
                            userId: ctx.currentUserId,
                        })
                    }
                    dispatch={(c) => dispatch({ t: "vs-bot", c })}
                />
            )
        }

        case "vs-user": {
            return (
                <VsUser.View
                    model={model.c}
                    ctx={ctx}
                    onCancel={() =>
                        dispatch({
                            t: "input-mode",
                            mode: "none",
                            userId: ctx.currentUserId,
                        })
                    }
                    dispatch={(c) => dispatch({ t: "vs-user", c })}
                />
            )
        }
    }
}

export const coverArt = CoverArt
