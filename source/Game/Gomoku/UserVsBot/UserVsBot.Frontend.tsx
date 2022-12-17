import { Cmd, Sub } from "../../../Core";
import { avatar, box, fillBox, icon, paper, typography } from "../../../UI";
import { Ctx, UserVsBotSetupPage } from "../../Game.Shared";
import {
    botLevels,
    stones,
    toOppositeStone,
    viewBoard,
    viewCoverArt,
    viewStoneIcon
} from "../Gomoku/Gomoku";
import { BackendModel, FrontendModel, FrontendMsg, initShared, ToBackend, ToFrontend } from "./UserVsBot.Types";

//
//
//
// model
//
//
//

export type Model = FrontendModel;

export const init: Model = initShared

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
        default: {
            if (msg[2].type === 'Err') {
                return [model, Cmd.None]
            }
            const merged = mergeWithBackend({
                frontendModel: model,
                backendModel: msg[2].value
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
                <UserVsBotSetupPage
                    botLevel={{
                        onInput: (botLevel) => $d(['InputBotLevel', { userId: ctx.currentUserId, botLevel }]),
                        selected: model.botLevel,
                        values: Object.values(botLevels)
                    }}
                    coverArt={viewCoverArt()}
                    player={{
                        onInput: (userStone) => $d(['InputUserStone', { userId: ctx.currentUserId, userStone }]),
                        selected: model.userStone,
                        values: Object.values(stones),
                        icon: (stone) => viewStoneIcon({ stone })
                    }}
                    ctx={ctx}
                    title="Gomoku"
                    subtitle="Vs Computer"
                    onCancel={onBack}
                    onStartPlaying={() => $d(['StartPlaying', { userId: ctx.currentUserId }])}
                    onStopPlaying={() => $d(['StopPlaying', { userId: ctx.currentUserId }])}
                    onStartGame={() => { }}
                    playerId={model.userId}
                />
            )
        }

        case 'game': {
            return (
                fillBox({}, [
                    viewPlayerSlots({ model }),
                    viewBoard({
                        board: model.board,
                        onPress: position => $d(['InputMove', { userId: ctx.currentUserId, position }])
                    }),
                    box({ flex: 1 }, []),
                    box({ display: 'flex' }, [

                    ])
                ])
            )
        }
    }
}


export const viewPlayerSlots = ({ model }: { model: Model }) => {
    const iconSize = {
        width: 32,
        height: 32
    }

    const botSlot =
        paper({ display: "flex", variant: "outlined", alignItems: "center", p: 1, width: "50%" }, [
            viewStoneIcon({ ...iconSize, stone: toOppositeStone(model.userStone), mr: 1 }),
            icon({ ...iconSize, name: "smart-toy", mr: 1, }),
            typography({}, [model.botLevel])
        ])

    const userSlot =
        paper({ display: "flex", variant: "outlined", alignItems: "center", p: 1, width: "50%" }, [
            viewStoneIcon({ ...iconSize, stone: model.userStone, mr: 1 }),
            avatar({ ...iconSize, mr: 1, src: ctx.profiles[model.userId]?.avatarUrl }),
            typography({ noWrap: true }, [ctx.profiles[model.userId]?.username])
        ])

    const whiteSlot = model.userStone === 'white' ? userSlot : botSlot
    const blackSlot = model.userStone === 'black' ? userSlot : botSlot

    return (
        box({ py: 2, display: "flex", gap: 2, justifyContent: "center", alignItems: 'center' }, [
            whiteSlot,
            blackSlot
        ])
    )

}