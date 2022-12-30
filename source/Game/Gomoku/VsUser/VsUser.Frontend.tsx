import { Cmd, Sub } from "../../../Core";
import { actionButton, box, button, conformation, fillBox, fragment, text } from "../../../UI";
import { Ctx, viewVsUserSetupScreen } from "../../Game";
import { viewBoard, viewCoverArt, viewStoneIcon } from "../Gomoku/Gomoku";
import { BackendModel, FrontendModel, FrontendMsg, initShared, ModelGameOver, ToBackend, ToFrontend } from "./VsUser.Types";

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

export const update = ({ msg, model, sendToBackend }: { sendToBackend: (m: ToBackend) => Cmd, msg: Msg, model: Model }): [Model, Cmd<Msg>] => {
    switch (msg[0]) {
        case 'ClickedCancel': {
            return [{ ...model, confirming: undefined }, Cmd.None]
        }

        case 'Resign': {
            if (model.confirming === 'Resign') {
                return [model, sendToBackend(msg)]
            }
            return [{ ...model, confirming: 'Resign' }, Cmd.None]
        }
        default: {
            return [model, sendToBackend(msg)]
        }
    }
};


export const updateFromBackend = (msg: ToFrontend, model: Model): [Model, Cmd<Msg>] => {
    switch (msg[0]) {
        default: {
            if (msg[1].type === 'Err') {
                return [model, Cmd.None]
            }
            const merged = mergeWithBackend({ backendModel: msg[1].value, frontendModel: model })
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

export const view = ({ model, ctx, onCancel, $send }: { $send: (m: Msg) => void; ctx: Ctx; model: Model, onCancel: () => void }) => {
    switch (model.type) {
        case 'setup': {
            return (
                viewVsUserSetupScreen({
                    title: "Gomoku",
                    subtitle: "Player Vs Player",
                    coverArt: viewCoverArt(),
                    ctx,
                    playerOne: {
                        label: 'White',
                        userId: model.white,
                        onStartPlaying: () => $send(['StartPlaying', { stone: 'white' }]),
                        onStopPlaying: () => $send(['StopPlaying', { stone: 'white' }]),
                        icon: (sx) => viewStoneIcon({ ...sx, stone: 'white' })
                    },
                    playerTwo: {
                        label: 'Black',
                        userId: model.black,
                        onStartPlaying: () => $send(['StartPlaying', { stone: 'black' }]),
                        onStopPlaying: () => $send(['StopPlaying', { stone: 'black' }]),
                        icon: sx => viewStoneIcon({ ...sx, stone: 'black' })
                    },
                    onCancel,
                    onStartGame: () => $send(['StartGame']),
                })
            )
        }

        case 'playing': {
            return (
                fillBox({}, [
                    viewVsUserSlots(),
                    viewBoard({
                        board: model.board,
                        onPress: position => $send(['InputMove', { position }])
                    }),
                    box({ flex: 1 }, []),
                    box({ display: 'flex', p: 2, }, [
                        actionButton({ label: 'Resign', iconName: 'flag', onPress: () => $send(['Resign']) }),
                    ]),
                    conformation({
                        open: 'Resign' === model.confirming,
                        title: 'Resign from game?',
                        iconName: 'flag',
                        confirmTitle: 'Resign',
                        onConfirm: () => $send(['Resign',]),
                        onCancel: () => $send(['ClickedCancel',]),
                        onClose: () => $send(['ClickedCancel',]),
                    }),

                ])
            )

        }

        case 'gameOver': {
            return (
                fillBox({}, [
                    viewVsUserSlots(),
                    box({ position: "relative", aspectRatio: "1", }, [
                        viewBoard({ board: model.board, }),
                        viewOverlay({ model, ctx }),
                    ]),
                    box({ p: 2, display: 'flex', gap: 2, flexDirection: 'column' }, [
                        button({ onPress: () => { }, variant: "contained", startIcon: 'restart', width: '100%', }, 'Rematch'),
                        button({ onPress: () => { }, variant: "contained", startIcon: 'exit', width: '100%', }, 'Back to lobby'),
                    ]),
                ])
            )
        }

    }

}

export const viewOverlay = ({ model, ctx }: { model: ModelGameOver, ctx: Ctx }) => {
    return (
        box({
            position: "absolute", top: 0, left: 0, width: "100%", height: '100%', backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex", justifyContent: "center", alignItems: "center",
        }, [
            viewOverlayContent({ model, ctx })
        ])
    )
}


export const viewVsUserSlots = () => {
    return (
        box({ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', }, [
            "slots"
            // viewUserSlot(playerOne),
            // viewUserSlot(playerTwo),
        ])
    )
}



export const viewOverlayContent = ({ model, ctx }: { model: ModelGameOver, ctx: Ctx }) => {

    const currentUserStone = ctx.currentUserId === model.white ? 'white' : 'black'
    if (model.gameOver.type === 'Resigned' && model.gameOver.resigner === currentUserStone) {
        return (
            text({ color: 'white', variant: 'h2', }, [
                'You resigned'
            ])
        )
    }

    if (model.gameOver.type === 'Resigned') {
        return (
            box({ display: 'flex', flexDirection: 'column', alignItems: 'center', }, [
                viewStoneIcon({ stone: model.gameOver.resigner, width: 100, height: 100 }),
                text({ color: 'white', variant: 'h2', }, "Resigned")
            ])
        )
    }


    return (
        fragment([

        ])
    )
}