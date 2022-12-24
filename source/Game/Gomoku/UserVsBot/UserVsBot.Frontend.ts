import { Cmd, Sub } from "../../../Core";
import { fragment, actionButton, avatar, box, fillBox, icon, paper, typography } from "../../../UI";
import { Ctx, viewUserVsBotSetupScreen } from "../../Game";
import {
    botLevels,
    stones,
    toOppositeStone,
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
            return (
                fillBox({}, [
                    viewPlayerSlots({ ctx, model }),
                    box({ display: 'flex', justifyContent: "center", alignItems: 'center', py: 1 }, [
                        viewMessage({ model }),
                    ]),
                    viewBoard({ board: model.board, onPress: position => $d(['InputMove', { position }]) }),
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

const viewMessage = ({ model }: { model: GameModel }) => {
    const turn = toTurn(model.board)

    if (turn === 'black') {
        return fragment([
            viewStoneIcon({ stone: "black", mr: 1 }),
            typography({}, ["Turn"])
        ])
    }

    return fragment([
        viewStoneIcon({ stone: "white", mr: 1 }),
        typography({}, ["Turn"])
    ])

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
            typography({}, [model.botLevel])
        ])

    const userSlot =
        paper({ display: "flex", variant: "outlined", alignItems: "center", p: 1, flex: 1, overflow: 'hidden' }, [
            viewStoneIcon({ ...iconSize, stone: model.userStone, mr: 1 }),
            avatar({ ...iconSize, mr: 1, src: ctx.profiles[model.userId]?.avatarUrl }),
            typography({ noWrap: true }, [ctx.profiles[model.userId]?.username])
        ])

    const whiteSlot = model.userStone === 'white' ? userSlot : botSlot

    const blackSlot = model.userStone === 'black' ? userSlot : botSlot

    return (
        box({ px: 2, pt: 2, display: "flex", gap: 2, justifyContent: "center", alignItems: 'center' }, [whiteSlot, blackSlot])
    )

}