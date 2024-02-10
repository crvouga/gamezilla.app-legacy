import {
    APP_SOUND,
    ClientCmd,
    playSound,
} from "gamezilla/@CHILD/app/@SHARED/client"
import { SpaceClientModule } from "../architechure/space-client"
import { SpaceEvent, Spaces } from "../spaces-core"
import { Game } from "../@CHILD/game/game.client"
import { WithEventId } from "../@SHARED/event"
import { Eff } from "gamezilla/@SHARED/core"

const update: SpaceClientModule["update"] = (input) => {
    return SpaceClientModule.chainUpdates(
        { model: input.model },
        //
        (model) => updateFromSpaceEvent({ ...input, model }),
        (model) => updateGame({ ...input, model }),
    )
}

const updateFromSpaceEvent: SpaceClientModule["update"] = (input) => {
    const { msgSpaceEvent, model, ctx } = input

    switch (msgSpaceEvent?.t) {
        case "user-inputted-game": {
            if (!ctx.currentUserId) {
                return { model }
            }

            const currentUserSpaceId = Spaces.toSpaceIdByUserId(
                model,
                ctx.currentUserId,
            )

            if (msgSpaceEvent.spaceId === currentUserSpaceId) {
                return {
                    model,
                    msgCmd: [
                        playSound(
                            msgSpaceEvent.game
                                ? APP_SOUND.navForwardMin
                                : APP_SOUND.navBackwardMin,
                        ),
                    ],
                }
            }
            return { model }
        }

        default: {
            return { model }
        }
    }
}

const inputToSpaceId = (input: Parameters<SpaceClientModule["update"]>[0]) => {
    if (input.msg && "spaceId" in input.msg) {
        return input.msg.spaceId
    }

    if (input.msgServer && "spaceId" in input.msgServer) {
        return input.msgServer.spaceId
    }

    return null
}

const updateGame: SpaceClientModule["update"] = (input) => {
    const { ctx, model, msgServer, msgEvt, msg, msgSpaceEvent } = input

    if (!ctx.currentUserId) {
        return { model }
    }

    const spaceId = inputToSpaceId(input)

    if (!spaceId) {
        return { model }
    }

    const spaceState = Spaces.toSpaceStarted(model, spaceId)

    if (!spaceState) {
        return { model }
    }

    const modelGame = spaceState.game

    if (!modelGame) {
        return { model }
    }

    const msgSpaceEventWithMeta = msgSpaceEvent?.eventId
        ? Spaces.toEventWithMeta(model, spaceId, msgSpaceEvent?.eventId)
        : null

    const gameModel = model.games[spaceId] ?? Game.init(modelGame.t)

    const gameUpdated = Game.update({
        ctx: {
            ...ctx,
            space: spaceState,
            currentUserId: ctx.currentUserId,
            quit() {},
            viewProfile() {},
        },
        model: gameModel,
        msgGame:
            msgSpaceEventWithMeta?.t === "game"
                ? { ...msgSpaceEventWithMeta, ...msgSpaceEventWithMeta.c }
                : null,
        modelGame: modelGame,
        msgServer: msgServer?.t === "game" ? msgServer.c : null,
        msgCmd: null,
        msgEvt,
        msg: msg?.t === "game" ? msg.c : null,
    })

    const msgSpaceEventNew = (gameUpdated.msgGame ?? []).map(
        (e): WithEventId<SpaceEvent> => ({ ...e, spaceId, t: "game", c: e }),
    )

    return {
        model: {
            ...model,
            games: {
                ...model.games,
                [spaceId]: gameUpdated.model,
            },
        },
        msgCmd: ClientCmd.map(
            gameUpdated.msgCmd ?? [],
            (c) => ({ t: "game", c, spaceId }),
            (c) => ({ t: "game", c, spaceId }),
        ),
        eff: Eff.map_((c) => ({ t: "game", c, spaceId }), gameUpdated.eff),
        msgEvt: [],
        msgSpaceEvent: msgSpaceEventNew,
    }
}

export const GameClient = {
    update,
}
