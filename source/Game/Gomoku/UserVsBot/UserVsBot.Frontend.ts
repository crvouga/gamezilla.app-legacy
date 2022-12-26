import { Cmd, Sub } from "../../../Core";
import { actionButton, avatar, box, button, fillBox, fragment, icon, paper, Sx, text } from "../../../UI";
import { Ctx, viewUserVsBotSetupScreen } from "../../Game";
import {
    botLevels,
    stones,
    toOppositeStone,
    toStatus,
    toTurn,
    viewBoard,
    viewCoverArt,
    viewStoneIcon
} from "../Gomoku/Gomoku";
import { BackendModel, FrontendModel, FrontendMsg, GameModel, initShared, ToBackend, ToFrontend } from "./UserVsBot.Types";

//
//
//
// model
//
//
//

export type Model = FrontendModel;

export const init = initShared

//
//
//
// update
//
//
//

export type Msg = FrontendMsg

export const update = ({ sendToBackend }: { sendToBackend: (m: ToBackend) => Cmd }, msg: Msg, model: Model): [Model, Cmd<Msg>] => {
    switch (msg[0]) {
        default: {
            return [model, sendToBackend(msg)]
        }
    }
};


export const updateFromBackend = (msg: ToFrontend, model: Model): [Model, Cmd<Msg>] => {
    switch (msg[0]) {
        case 'BotMoved': {
            const merged = mergeWithBackend({ frontendModel: model, backendModel: msg[1] })
            return [merged, Cmd.None]
        }

        default: {
            if (msg[1].type === 'Err') {
                return [model, Cmd.None]
            }
            const merged = mergeWithBackend({
                frontendModel: model,
                backendModel: msg[1].value
            })
            return [merged, Cmd.None]
        }
    }
};

export const mergeWithBackend = ({ backendModel }: { frontendModel: FrontendModel, backendModel: BackendModel }): FrontendModel => {
    return backendModel
}

//
//
//
// subscriptions
//
//
//

export const subscriptions = (_model: Model): Sub<Msg> => {
    return Sub.None;
};

// 
// 
// 
// view
// 
// 
// 

export const view = ({ $d, model, ctx, onBack }: { model: Model, ctx: Ctx, $d: (m: Msg) => void; onBack: () => void }) => {
    switch (model.type) {
        case 'setup': {
            return (
                viewUserVsBotSetupScreen({
                    botLevel: {
                        onInput: (botLevel) => $d(['InputBotLevel', { botLevel }]),
                        selected: model.botLevel,
                        values: Object.values(botLevels)
                    },
                    coverArt: viewCoverArt(),
                    player: {
                        onInput: (userStone) => $d(['InputUserStone', { userStone }]),
                        selected: model.userStone,
                        values: Object.values(stones),
                        icon: (stone) => viewStoneIcon({ stone })
                    },
                    ctx,
                    title: "Gomoku",
                    subtitle: "Vs Computer",
                    onCancel: onBack,
                    onStartPlaying: () => $d(['StartPlaying']),
                    onStopPlaying: () => $d(['StopPlaying']),
                    onStartGame: () => $d(['StartGame']),
                    playerId: model.userId,
                })
            )
        }

        case 'game': {
            if (model.userId !== ctx.currentUserId) {
                return fillBox({}, [
                    text({ color: 'primary.main', width: '100%', mt: 1, textAlign: 'center' }, ["You're Spectating"]),
                    viewPlayerSlots({ ctx, model }),
                    viewMessage({ ctx, model }),
                    box({ position: "relative", aspectRatio: "1", }, [
                        viewBoard({ board: model.board, onPress: position => $d(['InputMove', { position }]) }),
                        viewOverlay({ $d, model, ctx }),
                    ])
                ])
            }

            const status = toStatus(model.board)

            if (status.type === 'game_over') {
                return (
                    fillBox({}, [
                        viewPlayerSlots({ ctx, model }),
                        viewMessage({ ctx, model }),
                        box({ position: "relative", aspectRatio: "1", }, [
                            viewBoard({ board: model.board, onPress: position => $d(['InputMove', { position }]) }),
                            viewOverlay({ $d, ctx, model }),
                        ]),
                    ])
                )
            }

            return (
                fillBox({}, [
                    viewPlayerSlots({ ctx, model }),
                    viewMessage({ ctx, model }),
                    box({ position: "relative", aspectRatio: "1", }, [
                        viewBoard({ board: model.board, onPress: position => $d(['InputMove', { position }]) }),
                        viewOverlay({ $d, ctx, model }),
                    ]),
                    box({ flex: 1 }, []),
                    box({ display: 'flex' }, [
                        actionButton({ onPress: () => $d(['StopGame']), iconName: "exit", label: "Exit" }),
                        actionButton({ onPress: () => $d(['Restart']), iconName: "restart", label: "Restart" }),
                        actionButton({ onPress: () => $d(['SwapSides']), iconName: "swap", label: "Swap Sides" }),
                    ])
                ])
            )
        }
    }
}

export const viewUserVsBotGameScreen = () => {
    return fragment([])
}

const viewOverlay = ({ model, ctx, $d }: { ctx: Ctx, model: GameModel, $d: (m: Msg) => void }) => {
    const props: Sx = {
        position: 'absolute', top: 0, left: 0, width: '100%',
        display: 'flex', flexDirection: "column", justifyContent: 'center', alignItems: 'center',
        color: "#fff", backgroundColor: 'rgba(0,0,0,0.66)',
        aspectRatio: "1",
    }
    const status = toStatus(model.board)

    if (status.type === 'game_over' && ctx.currentUserId === model.userId) {
        return (
            box(props, [
                viewGameOverTitle({ model, ctx }),
                box({ width: '100%', display: 'flex', gap: 2, p: 2 }, [
                    button({ onPress: () => $d(['StopGame']), width: '100%', variant: "contained", size: "lg", startIcon: "exit" }, 'Exit'),
                    button({ onPress: () => $d(['Restart']), width: '100%', variant: "contained", size: "lg", startIcon: "restart" }, 'Play Again'),
                ])
            ])
        )
    }

    if (status.type === 'game_over') {
        return (
            box(props, [viewGameOverTitle({ model, ctx }),])
        )
    }

    return (
        fragment([])
    )
}

const viewGameOverTitle = ({ model, ctx }: { ctx: Ctx; model: GameModel }) => {
    const status = toStatus(model.board)

    if (status.type !== 'game_over') {
        return null
    }

    if (ctx.currentUserId === model.userId) {
        if (status.winner === model.userStone) {
            return (
                text({ variant: 'h1', }, ["You Won"])
            )
        }
        return (
            text({ variant: 'h1', }, ["You Lost"])
        )
    }

    const size: Sx = {
        width: 58,
        height: 58,
    }

    if (status.winner === model.userStone) {
        return (
            box({ display: 'flex', alignItems: "center", gap: 1 }, [
                viewStoneIcon({ stone: model.userStone, ...size }),
                avatar({ src: ctx.profiles[model.userId]?.avatarUrl, ...size }),
                text({ variant: 'h1', }, ["Won"])
            ])
        )
    }

    return (
        box({ display: 'flex', alignItems: "center", gap: 1 }, [
            viewStoneIcon({ stone: toOppositeStone(model.userStone), ...size }),
            icon('smart-toy', { mr: 1, ...size, }),
            text({ variant: 'h1', }, ["Won"])
        ])
    )

}

const viewMessage = ({ ctx, model }: { ctx: Ctx, model: GameModel }) => {
    const props = { display: 'flex', justifyContent: "center", alignItems: 'center', py: 1 } as const

    const status = toStatus(model.board)

    if (status.type === 'game_over') {
        return box(props, [
            text({}, ["Game Over"])
        ])
    }

    const turn = toTurn(model.board)

    if (ctx.currentUserId === model.userId && turn === model.userStone) {
        return box(props, [
            viewStoneIcon({ stone: turn, mr: 1, }),
            text({}, ["Your Turn"])
        ])
    }

    return box(props, [
        viewStoneIcon({ stone: turn, }),
        viewPlayerIcon({ ctx, model, mx: 1, stone: turn }),
        text({}, ["Turn"])
    ])

}

export const viewPlayerIcon = ({ ctx, model, stone, ...sx }: { ctx: Ctx, model: GameModel, stone: 'white' | 'black' } & Sx) => {
    const size = {
        width: 24,
        height: 24
    }
    if (model.userStone === stone) {
        return avatar({ src: ctx.profiles[model.userId]?.avatarUrl, ...size, ...sx })
    }
    return icon("smart-toy", { ...size, ...sx })
}

export const viewPlayerSlots = ({ model, ctx }: { ctx: Ctx, model: GameModel }) => {
    const iconSize = {
        width: 32,
        height: 32
    }

    const botSlot =
        paper({ display: "flex", variant: "outlined", alignItems: "center", p: 1, flex: 1, overflow: 'hidden' }, [
            viewStoneIcon({ ...iconSize, stone: toOppositeStone(model.userStone), mr: 1 }),
            icon("smart-toy", { ...iconSize, mr: 1, }),
            text({}, [model.botLevel])
        ])

    const userSlot =
        paper({ display: "flex", variant: "outlined", alignItems: "center", p: 1, flex: 1, overflow: 'hidden' }, [
            viewStoneIcon({ ...iconSize, stone: model.userStone, mr: 1 }),
            avatar({ ...iconSize, mr: 1, src: ctx.profiles[model.userId]?.avatarUrl }),
            text({ noWrap: true }, [ctx.profiles[model.userId]?.username])
        ])

    const whiteSlot = model.userStone === 'white' ? userSlot : botSlot

    const blackSlot = model.userStone === 'black' ? userSlot : botSlot

    return (
        box({ px: 2, pt: 2, display: "flex", gap: 2, justifyContent: "center", alignItems: 'center' }, [whiteSlot, blackSlot])
    )

}